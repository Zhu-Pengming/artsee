import React, { useState } from 'react';
import { MessageSquare, HelpCircle, Users, Hash, ChevronRight, Sparkles, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ChatUser } from '../types';

const SECTIONS = [
  { id: 'qa', label: '问答社区', icon: <HelpCircle /> },
  { id: 'circle', label: '专业圈子', icon: <Users /> },
  { id: 'salon', label: '轻量社交', icon: <Sparkles /> },
  { id: 'chat', label: '私信消息', icon: <MessageSquare /> },
];

const QA_BLOCKS = [
  { title: '艺术留学', count: '1.2k 讨论', color: 'bg-blue-50', text: 'text-blue-600' },
  { title: '专业学习', count: '850 记录', color: 'bg-purple-50', text: 'text-purple-600' },
  { title: '行业就业', count: '2.3k 回答', color: 'bg-green-50', text: 'text-green-600' },
  { title: '市场分析', count: '540 深度', color: 'bg-orange-50', text: 'text-orange-600' },
];

const SALON_EVENTS = [
  {
    title: '4.28 | 丽思卡尔顿：宋韵青瓷私享鉴赏会',
    location: '丽思卡尔顿 · 绅士行政酒廊',
    date: '周一 04.28 14:00',
    price: '¥358',
    clubName: 'artiqore 雅集部',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800',
    desc: '从汝窑到官窑，特邀资深藏家现场分享，近距离感受极致的极简东方美学。'
  },
  {
    title: '5.01 | 柏悦酒店：当代艺术与私域藏家对谈',
    location: '柏悦酒店 · 悦厅',
    date: '周四 05.01 15:30',
    price: '¥499',
    clubName: '藏家CLUB',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
    desc: '在云端之上，探讨当代艺术的资产配置与审美逻辑，仅限15席定向邀请。'
  }
];

export const SocialView = ({ 
  onChatRequest, 
  onTopicClick,
  onCircleClick,
  onQuestionClick,
  onSalonClick,
  onCovenantClick
}: { 
  onChatRequest: (user: ChatUser) => void;
  onTopicClick: (topic: any) => void;
  onCircleClick: (circle: any) => void;
  onQuestionClick: (question: any) => void;
  onSalonClick: (event: any) => void;
  onCovenantClick: () => void;
}) => {
  const [activeSection, setActiveSection] = useState('qa');

  const handleOpenChat = (id: string, name: string, avatar: string, type: string) => {
    onChatRequest({ id, name, avatar, type });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-ink italic">专业社区</h2>
          <p className="text-ink/40 text-[10px] tracking-widest uppercase mt-1">Networking & Discussions</p>
        </div>
        
        <div className="flex bg-silver/50 p-1.5 rounded-2xl w-full md:w-auto self-start">
          {SECTIONS.map(s => (
            <button 
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                activeSection === s.id ? "bg-white text-cobalt shadow-lg" : "text-ink/40 hover:text-ink/60"
              )}
            >
              {React.cloneElement(s.icon as React.ReactElement, { size: 14 })}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {activeSection === 'qa' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-10">
              <section className="space-y-6">
                <div className="flex justify-between items-center border-b border-silver/50 pb-4">
                  <h3 className="text-sm font-bold text-ink uppercase tracking-widest">垂直板块</h3>
                  <button className="text-[10px] text-cobalt font-bold flex items-center gap-1 hover:translate-x-1 transition-transform">EXPLORE <ChevronRight size={12} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {QA_BLOCKS.map(block => (
                     <div 
                        key={block.title} 
                        onClick={() => onTopicClick(block)}
                        className={cn("p-6 rounded-[2rem] border border-transparent hover:border-silver/40 transition-all group flex flex-col justify-between aspect-square shadow-sm cursor-pointer", block.color)}
                     >
                        <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center">
                          <Hash size={14} className={block.text} />
                        </div>
                        <div>
                          <h4 className={cn("text-sm font-bold whitespace-nowrap", block.text)}>{block.title}</h4>
                          <p className="text-[9px] text-ink/30 mt-1 uppercase font-bold tracking-widest">{block.count}</p>
                        </div>
                     </div>
                  ))}
                </div>
              </section>

              <section 
                onClick={onCovenantClick}
                className="bg-ink p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer"
              >
                 <div className="relative z-10">
                    <h3 className="text-xl font-serif font-bold italic mb-4">艺术创作者公约</h3>
                    <p className="text-xs text-white/40 leading-relaxed max-w-[200px]">加入我们的专业准则委员会，共同定义未来的艺术商业规则。</p>
                 </div>
                 <div className="mt-8 relative z-10">
                    <button className="px-6 py-2 bg-white text-ink text-[10px] font-bold rounded-full uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all">立即加入</button>
                 </div>
                 <img src="https://picsum.photos/seed/ink2/400/400" className="absolute top-0 right-0 w-32 h-32 object-cover mix-blend-overlay opacity-20 grayscale group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
              </section>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center border-b border-silver/50 pb-4">
               <h3 className="text-sm font-bold text-ink uppercase tracking-widest">大家都在问 (TOP)</h3>
               <div className="flex gap-4">
                 {['综合', '最新', '高赞'].map(t => (
                   <span key={t} className="text-[10px] font-bold text-ink/30 cursor-pointer hover:text-ink transition-colors">{t}</span>
                 ))}
               </div>
              </div>
              <div className="space-y-6">
                {[
                  { title: '坐标伦敦，想问一下RCA今年的交互设计面试更侧重于技术广度还是叙事深度？', tag: '留学咨询', author: '王教授', participants: 24 },
                  { title: '零基础跨专业申请建筑设计，作品集里放过多的实验性手工模型会减分吗？', tag: '作品集', author: '陈老师', participants: 18 },
                  { title: '想了解一下目前国内一线互联网大厂对 AIGC 视觉设计师的岗位需求和面试重点。', tag: '求职指引', author: '大厂HR-Lee', participants: 56 },
                  { title: '大家觉得在当代艺术语境下，传统的“工匠精神”是否正在被“算法生成”所解构？', tag: '艺术杂谈', author: '墨之', participants: 89 },
                  { title: '准备申请柏林艺术大学，德语等级没达到要求但作品集非常出色，有成功破格录取的案例吗？', tag: '院校百科', author: '小徐学长', participants: 12 },
                ].map((q, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    onClick={() => onQuestionClick(q)}
                    className="bg-white p-8 rounded-[2.5rem] border border-silver/40 shadow-sm hover:shadow-2xl hover:shadow-cobalt/5 transition-all group cursor-pointer"
                  >
                    <div className="flex gap-4 items-start">
                       <span className="shrink-0 bg-cobalt text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-cobalt/20">{q.tag}</span>
                       <h4 className="text-lg font-serif font-bold text-ink leading-tight group-hover:text-cobalt transition-colors italic">
                         {q.title}
                       </h4>
                    </div>
                    <p className="mt-4 text-sm text-ink/50 leading-relaxed line-clamp-2 pl-2 border-l-2 border-silver/50 ml-4">
                      从我往年的申请经验或行业观察来看，关键在于...
                    </p>
                    <div className="flex items-center justify-between mt-8 ml-4">
                       <div className="flex items-center gap-4">
                          <div className="flex -space-x-3">
                            {[1, 2, 3].map(j => (
                              <img key={j} src={`https://i.pravatar.cc/100?u=qa_u${i}${j}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" referrerPolicy="no-referrer" />
                            ))}
                          </div>
                          <span className="text-[10px] text-ink/30 font-bold uppercase tracking-tighter">{q.author} 等 {q.participants} 人已参与讨论</span>
                       </div>
                       <div className="flex gap-3">
                         <button className="text-[10px] text-ink/40 font-bold uppercase px-6 py-2.5 rounded-full border border-silver/50 hover:bg-silver/10 transition-all">收藏</button>
                         <button className="text-[10px] bg-ink text-white px-8 py-2.5 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-cobalt transition-all shadow-xl">写回答</button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'circle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: '当代媒介艺术研究圈', tag: 'Medium Arts', members: '1.2k' },
              { title: '新中式建筑美学研习社', tag: 'Neo-Chinese', members: '850' },
              { title: '伦敦艺术留学互助联盟', tag: 'UAL/RCA Prep', members: '3.4k' },
              { title: 'CG 概念设计与光影实验室', tag: 'Concept Design', members: '2.1k' },
              { title: '时尚策展与品牌叙事', tag: 'Fashion Curator', members: '560' },
              { title: 'Web3 数字艺术藏家俱乐部', tag: 'Crypto Art', members: '1.5k' },
            ].map((circle, i) => (
              <div 
                key={i} 
                onClick={() => onCircleClick(circle)}
                className="bg-white p-8 rounded-[3rem] border border-silver/40 shadow-sm group hover:border-cobalt transition-all flex flex-col justify-between aspect-square lg:aspect-auto cursor-pointer"
              >
                <div>
                  <div className="w-16 h-16 bg-silver/20 rounded-[2rem] flex items-center justify-center text-cobalt mb-6 group-hover:bg-cobalt group-hover:text-white transition-all">
                    <Users size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-ink italic leading-tight">{circle.title}</h3>
                  <p className="text-xs text-ink/30 mt-3 leading-relaxed uppercase tracking-widest font-bold">{circle.tag}</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                       <span className="text-[10px] font-bold text-ink/40 uppercase">{circle.members} Members</span>
                    </div>
                    <button className="text-[11px] font-black text-cobalt uppercase underline underline-offset-4">Learn More</button>
                  </div>
                  <button className="w-full py-4 rounded-2xl bg-ink text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-cobalt transition-all shadow-xl">申请加入</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'salon' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SALON_EVENTS.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSalonClick(event)}
                className="bg-white rounded-[3rem] overflow-hidden border border-silver/30 shadow-sm hover:shadow-2xl hover:border-cobalt/30 transition-all group cursor-pointer"
              >
                <div className="aspect-[21/9] relative overflow-hidden">
                  <img src={event.image} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" alt="" referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-ink/60 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/20">
                    Luxury Social
                  </div>
                </div>
                <div className="p-10 space-y-8">
                   <div className="space-y-3">
                      <h3 className="text-2xl font-serif font-bold italic text-ink leading-tight group-hover:text-cobalt transition-colors">{event.title}</h3>
                      <p className="text-sm text-ink/40 font-medium leading-relaxed">{event.desc}</p>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-silver/10">
                      <div className="flex items-center gap-2 text-ink/40">
                         <Calendar size={14} className="text-cobalt" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink/40">
                         <MapPin size={14} className="text-cobalt" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">{event.location}</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4">
                      <span className="text-xl font-serif font-black italic text-ink">{event.price}</span>
                      <button className="flex items-center gap-2 text-[10px] font-black text-cobalt uppercase underline underline-offset-4 tracking-widest group-hover:translate-x-2 transition-transform">
                        立即预约 <ArrowRight size={14} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeSection === 'chat' && (
           <div className="max-w-4xl mx-auto space-y-4">
              {[
                { name: '李艺凡', type: '独立策展人', avatar: 'https://i.pravatar.cc/100?u=chat1', message: '你好！看到你在发现版块发布的联名意向，我们可以聊聊具体的落地细节吗？', time: '10:45 AM', unread: 2 },
                { name: 'Sofia R.', type: '品牌总监', avatar: 'https://i.pravatar.cc/100?u=chat2', message: 'We loved your portfolio! Would you be open to a collaboration for our upcoming collection?', time: 'Yesterday', unread: 0 },
                { name: '陈默之', type: '数字艺术家', avatar: 'https://i.pravatar.cc/100?u=chat3', message: '关于那个青花解构的渲染方案，我有了一些新的思路...', time: 'Yesterday', unread: 0 },
                { name: 'Elena Wang', type: '画廊经理', avatar: 'https://i.pravatar.cc/100?u=chat4', message: '下周的闭门展你有兴趣参加吗？名额有限。', time: '2 days ago', unread: 0 },
                { name: 'Kento Sato', type: '建筑师', avatar: 'https://i.pravatar.cc/100?u=chat5', message: 'The material samples arrived. The texture is exactly what we were looking for.', time: 'Monday', unread: 0 },
                { name: '林若冰', type: '资深顾问', avatar: 'https://i.pravatar.cc/100?u=chat6', message: '关于 RCA 的面试准备，我为你重新整理了一份 Check-list。', time: 'Last week', unread: 0 },
              ].map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => handleOpenChat(`chat-${i}`, c.name, c.avatar, c.type)}
                  className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-silver/40 hover:shadow-xl hover:border-cobalt/30 transition-all group cursor-pointer"
                >
                  <div className="relative">
                    <img src={c.avatar} className="w-16 h-16 rounded-full border-2 border-silver/20 object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-bold text-ink group-hover:text-cobalt transition-colors italic">{c.type} · {c.name}</h4>
                      <span className="text-[10px] text-ink/20 font-bold uppercase tracking-widest">{c.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-ink/40 line-clamp-1 font-medium">{c.message}</p>
                      {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-cobalt text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-cobalt/30">{c.unread}</span>}
                    </div>
                  </div>
                </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

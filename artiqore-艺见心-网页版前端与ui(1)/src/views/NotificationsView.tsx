import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  MessageSquare, 
  Sparkles, 
  GraduationCap, 
  TrendingUp, 
  Trash2, 
  ChevronRight,
  Clock,
  Zap,
  Star,
  Circle
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  type: 'system' | 'interaction' | 'academic' | 'ai';
  title: string;
  content: string;
  time: string;
  isUnread: boolean;
  avatar?: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'academic',
    title: '申请进度更新',
    content: '您的皇家艺术学院 (RCA) 数字化设计硕士申请材料已进入初审阶段，请保持关注。',
    time: '2小时前',
    isUnread: true,
  },
  {
    id: '2',
    type: 'ai',
    title: '作品集建议生成完毕',
    content: 'AI 已根据您的最新草图生成了 5 条专业叙事优化建议，点击查看详情。',
    time: '4小时前',
    isUnread: true,
  },
  {
    id: '3',
    type: 'interaction',
    title: '收到新的评价',
    content: '策展人 Sarah Moore 在您的作品《呼吸的算法》下留言：“极具前瞻性的实验。”',
    time: '昨天 14:20',
    isUnread: false,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: '4',
    type: 'system',
    title: '特别关注提醒',
    content: '您本周收到了来自 DIOR 策展人的特别关注，您的商业潜力评分提升了 12%。',
    time: '昨天 10:05',
    isUnread: false,
  },
  {
    id: '5',
    type: 'academic',
    title: '新研报发布',
    content: '《2026 全球数字媒体艺术趋势报告》已发布，包含您关注的院校导师最新动态。',
    time: '2天前',
    isUnread: false,
  }
];

export const NotificationsView = () => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>('all');

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return n.isUnread;
    if (activeTab === 'system') return n.type === 'system' || n.type === 'ai';
    return true;
  });

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'academic': return <GraduationCap className="text-cobalt" size={18} />;
      case 'ai': return <Zap className="text-amber-500" size={18} />;
      case 'interaction': return <MessageSquare className="text-emerald-500" size={18} />;
      default: return <Sparkles className="text-purple-500" size={18} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-cobalt">
            <div className="w-8 h-[1px] bg-cobalt" />
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] italic">Notifications Center</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink italic tracking-tight">消息通知</h1>
            {unreadCount > 0 && (
              <span className="text-sm font-bold text-cobalt flex items-center gap-1">
                <Circle size={8} fill="currentColor" /> {unreadCount} 条未读
              </span>
            )}
          </div>
        </div>
        
        <button 
          onClick={markAllRead}
          className="text-[10px] font-black uppercase tracking-widest text-ink/40 hover:text-cobalt transition-colors flex items-center gap-2"
        >
          <Check size={14} /> 全部标记已读
        </button>
      </div>

      <div className="bg-silver/10 rounded-2xl p-1 flex gap-1 mx-4 md:mx-0">
        {(['all', 'unread', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-white text-cobalt shadow-sm" : "hover:bg-white/50 text-ink/40 hover:text-ink"
            )}
          >
            {tab === 'all' ? '全部动态' : tab === 'unread' ? '未读消息' : '系统与 AI'}
          </button>
        ))}
      </div>

      <div className="space-y-4 px-4 md:px-0">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={notification.id}
                className={cn(
                  "group relative bg-white border border-silver/30 rounded-2xl p-5 md:p-6 transition-all hover:shadow-xl hover:shadow-ink/5 flex gap-4 md:gap-6 items-start cursor-pointer",
                  notification.isUnread && "ring-1 ring-cobalt/20 bg-cobalt/[0.01]"
                )}
              >
                <div className="relative shrink-0">
                  {notification.avatar ? (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                      <img src={notification.avatar} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-silver/20 flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                  )}
                  {notification.isUnread && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cobalt rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn(
                      "text-sm font-bold text-ink truncate leading-none",
                      notification.isUnread && "text-cobalt"
                    )}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-ink/20 font-bold uppercase tracking-widest whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-xs md:text-[13px] text-ink/60 leading-relaxed">
                    {notification.content}
                  </p>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 hover:bg-red-50 text-ink/10 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-2 hover:bg-cobalt/5 text-ink/10 hover:text-cobalt rounded-lg transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-silver/10 rounded-full flex items-center justify-center mx-auto">
                <Bell size={24} className="text-ink/10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-ink">暂无动态</h3>
                <p className="text-xs text-ink/30">您关注的所有资讯都将呈现在这里</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-ink rounded-[2rem] p-8 md:p-12 text-white overflow-hidden relative mx-4 md:mx-0 shadow-2xl">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-white/40">
            <TrendingUp size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Weekly Insight</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-serif italic font-bold leading-tight">
              您的作品集正受到<br />
              伦敦艺术大学 (UAL)<br />
              <span className="text-cobalt brightness-150 underline decoration-white/20 underline-offset-8">学术委员会</span>的关注
            </h2>
          </div>
          <p className="text-sm text-white/50 leading-relaxed max-w-md">
            基于过去 7 天的数据分析，您的作品互动率超过了全球 92% 的申请者。
          </p>
          <button className="flex items-center gap-3 px-8 py-4 bg-white text-ink rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-cobalt hover:text-white transition-all shadow-xl shadow-white/5 group">
            查看竞争力分析周报
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cobalt/20 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full -ml-10 -mb-10" />
      </div>
    </div>
  );
};

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

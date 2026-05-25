import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Sparkles, 
  UserCircle2, 
  Bell, 
  LogOut, 
  ChevronLeft,
  Menu,
  SwitchCamera
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface BusinessLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onSwitchRole: () => void;
}

const SIDEBAR_ITEMS = [
  { id: 'workplace', label: '工作台', icon: <LayoutDashboard size={20} />, activeIcon: <LayoutDashboard size={20} className="text-cobalt" /> },
  { id: 'artist-market', label: '艺术家资源', icon: <Users size={20} />, activeIcon: <Users size={20} className="text-cobalt" /> },
  { id: 'projects', label: '项目合作', icon: <Briefcase size={20} />, activeIcon: <Briefcase size={20} className="text-cobalt" /> },
  { id: 'co-brand', label: '联名项目', icon: <Sparkles size={20} />, activeIcon: <Sparkles size={20} className="text-cobalt" /> },
  { id: 'brand-center', label: '品牌中心', icon: <UserCircle2 size={20} />, activeIcon: <UserCircle2 size={20} className="text-cobalt" /> },
];

export const BusinessLayout: React.FC<BusinessLayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange,
  onSwitchRole
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-porcelain overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-full bg-white border-r border-silver/50 transition-all duration-300 z-50 shrink-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-3 transition-opacity", isCollapsed ? "opacity-0" : "opacity-100")}>
            <div className="w-8 h-8 bg-cobalt rounded-lg flex items-center justify-center text-white font-serif font-black italic">B</div>
            <span className="font-serif font-bold text-ink italic">artiqore BIZ</span>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-silver/50 text-ink/40 hover:text-cobalt hover:border-cobalt transition-all"
          >
            <ChevronLeft className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} size={16} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group",
                activeView === item.id 
                  ? "bg-silver/30 text-cobalt" 
                  : "text-ink/40 hover:bg-silver/10 hover:text-ink/60"
              )}
            >
              <div className="transition-transform group-hover:scale-110">
                {activeView === item.id ? item.activeIcon : item.icon}
              </div>
              {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t border-silver/30">
          <button 
            onClick={onSwitchRole}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-ink/40 hover:bg-cobalt hover:text-white transition-all group",
            )}
          >
            <SwitchCamera size={20} />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">切换至C端</span>}
          </button>
          <button 
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500/60 hover:bg-red-50 hover:text-red-500 transition-all group",
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-silver/50 px-4 py-3 z-50 flex items-center justify-between">
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} className="text-ink" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cobalt rounded flex items-center justify-center text-white font-serif font-black italic text-[10px]">B</div>
          <span className="font-serif font-bold text-ink italic text-sm">artiqore BIZ</span>
        </div>
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-ink/40" />
          <div className="w-8 h-8 rounded-full border border-silver/30 overflow-hidden bg-silver/10">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-white z-[60] p-6 lg:hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="font-serif font-bold text-ink italic text-xl">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-ink/40 font-bold uppercase text-xs">Close</button>
            </div>
            <nav className="space-y-4">
              {SIDEBAR_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-6 p-4 rounded-2xl transition-all",
                    activeView === item.id ? "bg-cobalt text-white" : "bg-silver/10 text-ink/60"
                  )}
                >
                  {item.icon}
                  <span className="font-bold uppercase tracking-widest text-sm">{item.label}</span>
                </button>
              ))}
              <div className="pt-10 space-y-4 border-t border-silver/30">
                <button 
                  onClick={() => {
                    onSwitchRole();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-6 p-4 rounded-2xl bg-silver/10 text-ink/60"
                >
                  <SwitchCamera size={20} />
                  <span className="font-bold uppercase tracking-widest text-sm">切换至C端</span>
                </button>
                <button className="w-full flex items-center gap-6 p-4 rounded-2xl bg-red-50 text-red-500">
                  <LogOut size={20} />
                  <span className="font-bold uppercase tracking-widest text-sm">退出登录</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 lg:p-12 pt-20 lg:pt-12 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

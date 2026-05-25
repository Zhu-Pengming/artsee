import React, { useState } from 'react';
import { 
  Home, 
  Info, 
  MessageSquare, 
  Compass, 
  User, 
  Search, 
  Bell, 
  Plus, 
  Sparkles, 
  X,
  FileText,
  Video,
  PenTool,
  MessageCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  key?: React.Key;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center space-y-1 py-1 transition-colors",
      isActive ? "text-cobalt" : "text-gray-400"
    )}
  >
    <div className={cn(
      "p-1.5 rounded-xl transition-all duration-300",
      isActive && "bg-cobalt/5 scale-110"
    )}>
      {React.cloneElement(icon as React.ReactElement, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
    </div>
    <span className="text-[12px] font-medium tracking-wider uppercase font-sans">{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  hideNav?: boolean;
}

export const Layout = ({ children, activeView, setActiveView, hideNav = false }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: '首页', icon: <Search /> },
    { id: 'feed', label: '广场', icon: <Home /> },
    { id: 'info', label: '院校', icon: <Info /> },
    { id: 'club', label: '艺享会', icon: <Sparkles /> },
    { id: 'social', label: '社区', icon: <MessageSquare /> },
    { id: 'discover', label: '发现', icon: <Compass /> },
    { id: 'me', label: '我的', icon: <User /> },
  ];

  const quickActions = [
    { id: 'post', label: '分享动态', icon: <PenTool size={20} />, color: 'bg-cobalt', desc: '记录您的创作灵感' },
    { id: 'ask', label: 'AI 提问', icon: <Zap size={20} />, color: 'bg-amber-500', desc: '获取专业导师建议' },
    { id: 'portfolio', label: '上传作品', icon: <FileText size={20} />, color: 'bg-emerald-500', desc: 'AI 诊断申请进度' },
  ];

  const handleAction = (id: string) => {
    setIsMenuOpen(false);
    switch (id) {
      case 'post': setActiveView('writing-assistant'); break;
      case 'ask': setActiveView('ai-guide'); break;
      case 'portfolio': setActiveView('portfolio-diagnosis'); break;
      default: break;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white selection:bg-cobalt/10 relative overflow-hidden font-sans">
      {/* Search Header / Top Nav for Web */}
      {!hideNav && (
        <header className={cn(
          "px-4 py-2 md:py-4 bg-white/70 backdrop-blur-md sticky top-0 z-40 shrink-0 transition-all",
          activeView === 'home' ? "hidden md:block" : "block border-b border-silver/30"
        )}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer" onClick={() => setActiveView('home')}>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-cobalt rounded-lg md:rounded-xl flex items-center justify-center text-white font-serif font-bold text-base md:text-xl shadow-lg shadow-cobalt/20">艺</div>
              <h1 className="text-lg md:text-xl font-serif font-bold text-ink tracking-tighter hidden md:block italic">artiqore 艺见心</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <nav className="hidden lg:flex items-center gap-10">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "text-[13px] font-black tracking-[0.1em] uppercase transition-all relative py-2 px-1",
                      activeView === item.id ? "text-cobalt" : "text-ink/30 hover:text-ink/60"
                    )}
                  >
                    {item.label}
                    {activeView === item.id && (
                      <motion.div 
                        layoutId="top-nav-accent" 
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-cobalt rounded-full shadow-[0_0_8px_rgba(30,58,138,0.3)]" 
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <AnimatePresence>
              {!isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-3 md:gap-6"
                >
                  <button 
                    onClick={() => setActiveView('notifications')}
                    className={cn(
                      "relative w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center border transition-all shadow-sm hover:shadow-md active:scale-95",
                      activeView === 'notifications' 
                        ? "bg-cobalt text-white border-cobalt shadow-lg shadow-cobalt/20" 
                        : "bg-white border-silver/50 text-ink/40 hover:text-cobalt"
                    )}
                  >
                    <Bell size={18} />
                    {activeView !== 'notifications' && (
                      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-cobalt rounded-full ring-2 ring-white"></span>
                    )}
                  </button>
                  <div 
                    onClick={() => setActiveView('me')}
                    className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-white ring-1 ring-silver/30 cursor-pointer hover:ring-cobalt/50 transition-all active:scale-90 shadow-sm"
                  >
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
      )}

      <main className={cn(
        "flex-1 scroll-smooth",
        (activeView === 'home' && !hideNav) ? "overflow-hidden" : "overflow-y-auto"
      )}>
        <div className={cn(
          "max-w-7xl mx-auto flex flex-col",
          (!hideNav && activeView !== 'home') && "px-4 md:px-6 py-4 md:py-8",
          (!hideNav && activeView === 'home') && "px-0 md:px-6 py-0 md:py-0 h-full",
          hideNav && "px-4 md:px-8 py-8 md:py-12 min-h-screen w-full"
        )}>
          {children}
        </div>
      </main>

      {/* Floating Action Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[45]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-36 md:bottom-44 right-4 md:right-8 lg:bottom-28 lg:right-12 z-50 w-64 space-y-3"
            >
              {quickActions.map((action, idx) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                  onClick={() => handleAction(action.id)}
                  className="w-full group bg-white border border-silver/30 rounded-2xl p-4 flex gap-4 items-center hover:shadow-2xl transition-all active:scale-95"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                    action.color
                  )}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-ink leading-tight">{action.label}</p>
                    <p className="text-xs text-ink/30 font-bold uppercase tracking-widest leading-none mt-1">{action.desc}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!hideNav && activeView !== 'home' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            "fixed bottom-20 md:bottom-24 right-4 md:right-8 lg:bottom-12 lg:right-12 w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl shadow-2xl z-50 flex items-center justify-center transition-all group",
            isMenuOpen ? "bg-white text-ink rotate-45" : "bg-ink text-white hover:bg-cobalt hover:shadow-cobalt/20"
          )}
        >
          <Plus size={24} className="md:w-8 md:h-8" />
        </motion.button>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <nav className="lg:hidden bg-white/80 backdrop-blur-xl border-t border-silver/50 z-50 pt-2 pb-safe shrink-0">
          <div className="grid grid-cols-7 px-2 h-16">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeView === item.id}
                onClick={() => setActiveView(item.id)}
              />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

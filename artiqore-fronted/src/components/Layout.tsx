import React from 'react';
import { Home, Info, MessageSquare, Compass, User, Search, Bell, Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
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
    <span className="text-[10px] font-medium tracking-wider uppercase font-sans">{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Layout = ({ children, activeView, setActiveView }: LayoutProps) => {
  const navItems = [
    { id: 'home', label: '首页', icon: <Home /> },
    { id: 'info', label: '院校', icon: <Info /> },
    { id: 'club', label: '艺享会', icon: <Sparkles /> },
    { id: 'social', label: '社区', icon: <MessageSquare /> },
    { id: 'discover', label: '发现', icon: <Compass /> },
    { id: 'me', label: '我的', icon: <User /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-porcelain selection:bg-cobalt/10 relative overflow-hidden font-sans">
      {/* Search Header / Top Nav for Web */}
      <header className="px-6 py-4 bg-white/70 backdrop-blur-md sticky top-0 z-40 border-b border-silver/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('home')}>
            <div className="w-10 h-10 bg-cobalt rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg shadow-cobalt/20">艺</div>
            <h1 className="text-xl font-serif font-bold text-ink tracking-tighter hidden md:block italic">artiqore 艺见心</h1>
          </div>

          <div className="flex-1 max-w-xl group hidden sm:flex">
            <div className="w-full bg-silver/50 shadow-inner rounded-full h-11 flex items-center px-5 gap-3 border border-white/60 focus-within:border-cobalt/30 transition-all">
              <Search size={18} className="text-ink/30" />
              <input 
                type="text" 
                placeholder="搜索艺术家、作品集资讯、灵感..." 
                className="bg-transparent border-none text-sm focus:ring-0 focus:outline-none w-full placeholder:text-ink/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center gap-8 mr-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "text-xs font-bold tracking-[0.2em] uppercase transition-all relative py-2",
                    activeView === item.id ? "text-cobalt" : "text-ink/40 hover:text-ink/60"
                  )}
                >
                  {item.label}
                  {activeView === item.id && (
                    <motion.div layoutId="top-nav-accent" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cobalt" />
                  )}
                </button>
              ))}
            </nav>

            <button className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center border border-silver/50 text-ink/60 hover:text-cobalt transition-colors shadow-sm">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-cobalt rounded-full ring-2 ring-white"></span>
            </button>
            <div 
              onClick={() => setActiveView('me')}
              className="hidden md:block w-11 h-11 rounded-full overflow-hidden border border-silver/50 cursor-pointer hover:border-cobalt/50 transition-colors active:scale-95"
            >
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-14 h-14 bg-ink text-white rounded-2xl shadow-2xl z-50 flex items-center justify-center hover:bg-cobalt transition-colors group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden bg-white/80 backdrop-blur-xl border-t border-silver/50 z-50 pt-2 pb-safe">
        <div className="grid grid-cols-6 px-4 h-16">
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
    </div>
  );
};

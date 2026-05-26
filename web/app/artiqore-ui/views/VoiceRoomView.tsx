// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ChevronLeft, Mic, MicOff, MessageSquare, Users, Settings, Share2, Plus, Zap, Globe, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface VoiceRoomViewProps {
  circleTitle: string;
  onBack: () => void;
}

export const VoiceRoomView = ({ circleTitle, onBack }: VoiceRoomViewProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasRequestedToSpeak, setHasRequestedToSpeak] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const chatInputRef = React.useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState([
    { id: 1, user: 'Maya', msg: '关于算法生成的非对称性，这一点在刚才的作品里体现得很精彩。', time: '1m ago' },
    { id: 2, user: 'Liam', msg: '我想问一下主理人，关于碳中和媒介的成本问题。', time: 'Just now' },
    { id: 3, user: 'Chloe', msg: '🔥🔥🔥 这个观点太棒了！', time: 'Just now' }
  ]);
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  const handleSendReaction = (emoji: string) => {
    const id = Date.now();
    const x = Math.random() * 100 - 50; // Random horizontal drift
    setReactions(prev => [...prev.slice(-20), { id, emoji, x }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      user: 'You',
      msg: chatMessage,
      time: 'Just now'
    };
    setMessages(prev => [...prev, newMsg]);
    setChatMessage('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    handleSendReaction(isMuted ? '🎤' : '🔇');
  };

  const focusChat = () => {
    chatInputRef.current?.focus();
    handleSendReaction('💬');
  };
  
  const speakers = [
    { id: 1, name: 'Sebastian', role: 'Moderator', avatar: 'https://i.pravatar.cc/100?u=s1', isTalking: !isMuted },
    { id: 2, name: 'Elena', role: 'Expert', avatar: 'https://i.pravatar.cc/100?u=s2', isTalking: false },
    { id: 3, name: 'Zhang Wei', role: 'Artist', avatar: 'https://i.pravatar.cc/100?u=s3', isTalking: false },
    { id: 4, name: 'Yuki', role: 'Curator', avatar: 'https://i.pravatar.cc/100?u=s4', isTalking: false },
  ];

  const listeners = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 5,
    name: `User ${i + 5}`,
    avatar: `https://i.pravatar.cc/100?u=u${i + 5}`
  }));

  return (
    <div className="fixed inset-0 bg-[#050505] text-white z-[100] flex flex-col font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cobalt/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-12 py-4 md:py-8 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 active:scale-90 transition-all border border-white/5"
          >
             <ChevronLeft size={20} />
          </button>
          <div className="max-w-[150px] sm:max-w-none">
            <h1 className="text-sm md:text-2xl font-serif font-bold italic leading-tight truncate">{circleTitle}</h1>
            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[8px] md:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/40 truncate">Live: 后现代视觉的听觉转化</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-2xl border border-white/5">
             <Users size={14} className="text-cobalt" />
             <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">128 Online</span>
          </div>
          <button 
            onClick={() => handleSendReaction('🔗')}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => handleSendReaction('⚙️')}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout: Split Screen for Large, Unified for Mobile */}
      <main className="flex-1 relative z-10 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden">
        {/* Visual/Speakers Zone */}
        <div className="flex-1 lg:col-span-8 flex flex-col p-6 md:p-12 overflow-y-auto no-scrollbar">
           {/* Section Header */}
           <div className="flex items-center justify-between mb-8 lg:mb-12 sticky top-0 bg-[#050505]/50 backdrop-blur-md py-2 z-20">
              <div className="flex items-center gap-3">
                 <Zap size={18} className="text-cobalt" />
                 <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-white/40">The Stage</h2>
              </div>
              <button 
                onClick={() => setHasRequestedToSpeak(!hasRequestedToSpeak)}
                className={cn(
                  "px-4 lg:px-6 py-2 lg:py-2.5 rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-[0.2em] lg:tracking-widest transition-all active:scale-95",
                  hasRequestedToSpeak 
                    ? "bg-white/10 text-white/40 border border-white/10" 
                    : "bg-cobalt ring-4 ring-cobalt/20 text-white hover:ring-8 shadow-lg shadow-cobalt/20"
                )}
              >
                 {hasRequestedToSpeak ? 'Request Sent' : 'Request to Speak'}
              </button>
           </div>

           {/* Speakers Grid */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 mb-16 lg:mb-24">
              {speakers.map((speaker, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={speaker.id} 
                  className="text-center group"
                >
                  <div className="relative inline-block mb-4 lg:mb-6">
                    <motion.div 
                      animate={speaker.isTalking ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className={cn(
                        "w-28 h-28 lg:w-40 lg:h-40 rounded-[2.5rem] lg:rounded-[4rem] p-1 lg:p-1.5 transition-all duration-700",
                        speaker.isTalking ? "bg-gradient-to-tr from-cobalt to-purple-500 shadow-[0_0_40px_rgba(37,99,235,0.3)]" : "bg-white/10"
                      )}
                    >
                      <img 
                        src={speaker.avatar} 
                        className="w-full h-full rounded-[2.3rem] lg:rounded-[3.5rem] object-cover" 
                        alt="" 
                        referrerPolicy="no-referrer" 
                      />
                    </motion.div>
                    {speaker.isTalking && (
                      <div className="absolute -bottom-1 lg:-bottom-2 -right-1 lg:-right-2 w-10 h-10 lg:w-12 lg:h-12 bg-cobalt rounded-xl lg:rounded-2xl border-4 border-[#050505] flex items-center justify-center shadow-lg">
                        <Mic size={16} className="text-white animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base lg:text-3xl font-serif font-bold italic tracking-tight">{speaker.name}</h3>
                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">{speaker.role}</p>
                  </div>
                </motion.div>
              ))}
           </div>

           {/* Audience Section */}
           <div className="space-y-6 lg:space-y-12 pb-32 lg:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Globe size={16} className="text-white/20" />
                   <h2 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-white/20">The Audience</h2>
                </div>
                <div className="lg:hidden text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  128 Connected
                </div>
              </div>
              <div className="flex lg:flex-wrap gap-4 overflow-x-auto lg:overflow-visible no-scrollbar pb-6 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
                 {listeners.map((listener) => (
                   <motion.div
                     key={listener.id}
                     whileHover={{ scale: 1.1, zIndex: 10 }}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => handleSendReaction('👏')}
                     className="relative cursor-pointer group shrink-0"
                   >
                     <img 
                       src={listener.avatar} 
                       className="w-12 h-12 lg:w-12 lg:h-12 rounded-2xl object-cover opacity-30 lg:opacity-30 group-hover:opacity-100 group-active:opacity-100 transition-all grayscale group-hover:grayscale-0" 
                       alt="" 
                       referrerPolicy="no-referrer" 
                     />
                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050505] opacity-0 group-hover:opacity-100 transition-opacity" />
                   </motion.div>
                 ))}
                 <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/20 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                   +112
                 </div>
              </div>
           </div>
        </div>

        {/* Chat / Sidebar Zone (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col bg-white/[0.02] border-l border-white/5 backdrop-blur-3xl m-6 mr-12 rounded-[3.5rem] overflow-hidden border border-white/5">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <MessageSquare size={18} className="text-cobalt" />
                 <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/60">Live Feed</h3>
              </div>
              <div className="flex gap-1">
                 {[1, 2, 3].map(i => <div key={i} className={cn("w-1 h-3 bg-cobalt rounded-full animate-pulse", i === 2 ? "h-5" : "h-3")} style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
              {messages.map((chat, i) => (
                <motion.div 
                  key={chat.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-2 group"
                >
                   <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-bold tracking-widest",
                        chat.user === 'You' ? "text-purple-400" : "text-cobalt"
                      )}>{chat.user}</span>
                      <span className="text-[9px] text-white/20">{chat.time}</span>
                   </div>
                   <p className="text-md text-white/60 leading-relaxed italic border-l border-white/5 pl-4 py-1 group-hover:border-cobalt transition-all">
                     {chat.msg}
                   </p>
                </motion.div>
              ))}
           </div>

           <div className="p-6 bg-black/40 backdrop-blur-3xl border-t border-white/5 space-y-4 relative">
              <div className="flex flex-wrap gap-2">
                 {['👏', '🔥', '🎨', '👀', '❤️'].map(emoji => (
                   <button 
                     key={emoji} 
                     onClick={() => handleSendReaction(emoji)}
                     className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg transition-transform active:scale-90"
                   >
                     {emoji}
                   </button>
                 ))}
              </div>

              <form onSubmit={handleSendMessage} className="relative">
                 <input 
                   type="text" 
                   ref={chatInputRef}
                   value={chatMessage}
                   onChange={(e) => setChatMessage(e.target.value)}
                   placeholder="Send a reaction..." 
                   className="w-full h-14 bg-white/5 rounded-2xl px-6 text-xs font-bold border border-white/5 focus:border-cobalt/40 outline-none transition-all placeholder:text-white/10" 
                 />
                 <button 
                   type="submit"
                   className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-cobalt hover:scale-110 transition-transform active:scale-90"
                 >
                    <Plus size={20} />
                 </button>
              </form>
           </div>
        </div>
      </main>

      {/* Control Bar - Mobile Optimized */}
      <footer className="fixed bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:gap-4 px-4 lg:px-8 py-3 lg:py-5 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full z-[100] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-[90%] lg:w-auto">
        <button 
          onClick={toggleMute}
          className={cn(
            "w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 shrink-0",
            isMuted ? "bg-red-500 text-white ring-4 ring-red-500/20" : "bg-white text-ink lg:hover:bg-cobalt lg:hover:text-white"
          )}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        
        <div className="h-8 lg:h-10 w-px bg-white/10 mx-1 lg:mx-2 shrink-0" />

        <button 
          onClick={() => {
            if (window.innerWidth < 1024) {
              setIsMobileChatOpen(true);
            } else {
              focusChat();
            }
          }}
          className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/5 lg:hover:bg-white/10 text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
        >
          <MessageSquare size={18} />
        </button>

        <div className="relative shrink-0">
          <button 
            onClick={() => setIsToolboxOpen(!isToolboxOpen)}
            className={cn(
              "w-12 h-12 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all active:scale-95",
              isToolboxOpen ? "bg-cobalt text-white scale-110" : "bg-white/5 lg:hover:bg-white/10 text-white"
            )}
          >
            <Plus size={18} />
          </button>
          
          <AnimatePresence>
            {isToolboxOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-white rounded-[1.5rem] lg:rounded-3xl p-2 lg:p-3 shadow-2xl min-w-[160px] lg:min-w-[200px]"
              >
                <div className="space-y-1">
                  {[
                    { icon: <Users size={14} />, label: 'Invite' },
                    { icon: <MessageSquare size={14} />, label: 'Record' },
                    { icon: <Settings size={14} />, label: 'Settings' },
                  ].map((item, i) => (
                    <button 
                      key={i}
                      onClick={() => setIsToolboxOpen(false)}
                      className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 lg:hover:bg-porcelain rounded-xl lg:rounded-2xl transition-colors text-ink text-[10px] lg:text-xs font-black uppercase tracking-widest text-left"
                    >
                      <div className="text-cobalt">{item.icon}</div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={onBack}
          className="flex-1 lg:flex-none px-6 lg:px-10 h-12 lg:h-16 bg-red-500/20 lg:hover:bg-red-500 text-red-500 lg:hover:text-white rounded-full text-[9px] lg:text-xs font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] transition-all active:scale-95 border border-red-500/30 ml-1 lg:ml-2"
        >
          Leave
        </button>
      </footer>

      {/* Floating Reactions Layer (Global) */}
      <div className="fixed inset-x-0 bottom-32 h-64 pointer-events-none overflow-hidden z-50">
         <AnimatePresence>
            {reactions.map((r) => (
               <motion.div
                 key={r.id}
                 initial={{ y: 0, x: r.x, opacity: 0, scale: 0.5 }}
                 animate={{ y: -300, opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.2, 1] }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 2, ease: "easeOut" }}
                 className="absolute bottom-0 left-1/2 text-3xl md:text-4xl"
               >
                  {r.emoji}
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Mobile Chat Drawer */}
      <AnimatePresence>
        {isMobileChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileChatOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 h-[85vh] bg-[#0a0a0a] rounded-t-[3rem] border-t border-white/10 z-[120] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-6" />
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-8 pb-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 italic">Live Feed</h3>
                  <button onClick={() => setIsMobileChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/20"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8 no-scrollbar">
                  {messages.map((chat) => (
                    <motion.div 
                      key={chat.id} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                         <span className={cn(
                           "text-[9px] font-black uppercase tracking-widest",
                           chat.user === 'You' ? "text-purple-400" : "text-cobalt"
                         )}>{chat.user}</span>
                         <span className="text-[8px] text-white/20">{chat.time}</span>
                      </div>
                      <p className="text-sm md:text-md text-white/60 leading-relaxed italic border-l border-white/5 pl-4 py-1">
                        {chat.msg}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
                  <div className="flex justify-between -mx-2">
                     {['👏', '🔥', '🎨', '👀', '❤️'].map(emoji => (
                        <button 
                          key={emoji} 
                          onClick={() => handleSendReaction(emoji)}
                          className="flex-1 h-12 flex items-center justify-center text-xl active:bg-white/5 rounded-xl transition-all"
                        >
                          {emoji}
                        </button>
                     ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="relative">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Share your insight..." 
                      className="w-full h-14 bg-white/5 rounded-3xl px-6 text-sm font-bold border border-white/5 focus:border-cobalt/40 outline-none transition-all placeholder:text-white/10" 
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-cobalt text-white rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                       <Plus size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

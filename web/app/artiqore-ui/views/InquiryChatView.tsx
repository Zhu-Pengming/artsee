// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Sparkles, User, ShieldCheck, Clock, Zap, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface InquiryChatViewProps {
  onBack: () => void;
  hostName: string;
  isPopup?: boolean;
}

export const InquiryChatView = ({ onBack, hostName, isPopup }: InquiryChatViewProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: `您好，我是 ${hostName}。关于本次星级酒店旅拍行程，您有任何个性化需求或疑问吗？`, sender: 'host', time: '10:00' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      text: message,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setMessage('');

    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "收到您的咨询。正在调取该行程的最新排期与套房状态...",
        sender: 'host',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className={cn(
      "bg-[#050505] text-white flex flex-col selection:bg-cobalt transition-all duration-500",
      isPopup ? "h-[600px] w-[400px] rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden" : "h-screen w-full"
    )}>
      {/* Header */}
      <header className={cn(
        "px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl relative z-50",
        isPopup ? "h-20" : "h-20 md:h-28 md:px-12"
      )}>
        <div className="flex items-center gap-4">
           {!isPopup && (
             <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={24} />
             </button>
           )}
           <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden",
                  isPopup ? "w-10 h-10" : "w-10 h-10 md:w-14 md:h-14"
                )}>
                   <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#050505] animate-pulse" />
              </div>
              <div>
                <h3 className={cn("font-serif font-black italic", isPopup ? "text-sm" : "text-sm md:text-lg")}>{hostName}</h3>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-cobalt flex items-center gap-2">
                  <ShieldCheck size={10} /> Experience Designer
                </p>
              </div>
           </div>
        </div>

        {isPopup ? (
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white hover:text-ink transition-all">
            <X size={16} />
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-8">
             <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Response Rate</p>
                <p className="text-[10px] font-bold text-emerald-500">Fast · &lt; 5m</p>
             </div>
             <div className="w-[1px] h-8 bg-white/5" />
             <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Local Time</p>
                <p className="text-[10px] font-bold">10:42 AM (GZ)</p>
             </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto p-6 space-y-8",
          !isPopup && "md:p-12 md:space-y-12"
        )}
      >
        <div className="flex justify-center">
           <span className="px-4 py-1.5 bg-white/5 border border-white/5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/20">
             Initiating Strategic Consultation
           </span>
        </div>

        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex flex-col gap-2",
              isPopup ? "max-w-[90%]" : "max-w-[85%] md:max-w-[70%]",
              msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-lg leading-relaxed font-light italic",
              msg.sender === 'user' 
                ? "bg-cobalt text-white rounded-tr-none shadow-2xl shadow-cobalt/20" 
                : "bg-white/5 border border-white/10 text-white/80 rounded-tl-none backdrop-blur-xl"
            )}>
              {msg.text}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-white/20 px-2">{msg.time}</span>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className={cn("p-6 border-t border-white/5 bg-black/40 backdrop-blur-3xl", !isPopup && "md:p-12")}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
           {!isPopup && (
             <button className="hidden md:flex w-14 h-14 rounded-2xl bg-white/5 border border-white/10 items-center justify-center text-white/40 hover:bg-white hover:text-ink transition-all">
                <Plus size={24} />
             </button>
           )}
           
           <div className="flex-1 relative">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="发送您的审美咨询与需求..."
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-2xl px-6 pr-12 text-sm font-light italic focus:outline-none focus:border-cobalt transition-all",
                  isPopup ? "h-12" : "h-14 md:h-20 md:rounded-3xl md:px-8 md:pr-16 md:text-xl"
                )}
              />
              <button 
                onClick={handleSend}
                className={cn(
                  "absolute right-2 top-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                  !isPopup && "md:right-5 md:top-5 md:w-10 md:h-10 md:rounded-2xl",
                  message ? "bg-cobalt text-white shadow-lg" : "bg-white/10 text-white/20 pointer-events-none"
                )}
              >
                <Send size={16} />
              </button>
           </div>
        </div>
      </div>
      {/* Footer Status */}
      {!isPopup && (
        <div className="hidden md:flex h-12 px-12 items-center justify-between bg-black/60 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Secure Strategic Channel #8819</span>
          </div>
          <div className="flex gap-8 text-[8px] font-black uppercase tracking-[0.2em] text-white/10">
            <span>Encrypted Endpoint</span>
            <span>Verified Access</span>
          </div>
        </div>
      )}
    </div>
  );
};

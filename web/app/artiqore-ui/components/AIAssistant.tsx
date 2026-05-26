// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Minus, Bot, MessageSquare, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { chatWithAI } from '../services/aiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '你好！我是 artiqore AI 助手。有什么我可以帮你的吗？不管是查看院校、艺术资讯还是平台导航，我都在这里。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const aiResponse = await chatWithAI(newMessages);
    setMessages([...newMessages, { role: 'model', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0, x: 20 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-52 right-4 h-11 w-11 md:bottom-52 md:right-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl shadow-[0_10px_40px_rgba(30,58,138,0.4)] z-[100] flex items-center justify-center transition-all group",
          isOpen 
            ? "bg-cobalt text-white" 
            : "bg-gradient-to-r from-cobalt via-cobalt/90 to-ink text-white"
        )}
      >
        {/* Glowing Background Effect when visible */}
        {!isOpen && (
          <span className="absolute -inset-0.5 bg-gradient-to-r from-cobalt to-indigo-600 rounded-xl md:rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse" />
        )}
        
        <div className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="sparkles"
                className="flex items-center justify-center"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
              >
                <Sparkles size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-8 lg:bottom-12 lg:right-32 w-[350px] md:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-silver/50 flex flex-col overflow-hidden z-[99]"
          >
            {/* Header */}
            <div className="bg-ink p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cobalt rounded-xl flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight italic">artiqore AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Intelligent Concierge</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Minus size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-porcelain/50 no-scrollbar"
            >
              <div className="text-center py-2">
                <span className="text-[9px] text-ink/20 font-bold uppercase tracking-[0.3em]">Conversation Started</span>
              </div>
              
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-ink text-porcelain rounded-br-none shadow-sm" 
                      : "bg-white text-ink rounded-bl-none shadow-sm border border-silver/30"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-4 rounded-3xl rounded-bl-none shadow-sm border border-silver/30 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cobalt rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-cobalt rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-cobalt rounded-full animate-bounce" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white border-t border-silver/30">
              <div className="flex items-center gap-3 bg-porcelain p-2 rounded-2xl border border-silver/50 focus-within:border-cobalt transition-colors">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="询问艺术相关的问题..."
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-ink placeholder:text-ink/30 px-3"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    input.trim() && !isLoading ? "bg-cobalt text-white shadow-lg" : "bg-ink/10 text-ink/20"
                  )}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[8px] text-ink/20 text-center mt-3 uppercase tracking-widest font-bold">
                Powered by Gemini • Art Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

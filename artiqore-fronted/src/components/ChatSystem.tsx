import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Smile, Paperclip, MoreHorizontal, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatUser, ChatMessage } from '../types';

interface ChatWindowProps {
  user: ChatUser;
  onClose: () => void;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', senderId: 'user1', text: '你好！非常喜欢您的作品。', timestamp: '10:00', isMe: false },
  { id: '2', senderId: 'me', text: '谢谢！很高兴认识你。', timestamp: '10:02', isMe: true },
  { id: '3', senderId: 'user1', text: '有机会可以合作吗？', timestamp: '10:05', isMe: false },
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ user, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: user.id,
        text: '收到！我会尽快回复您的。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-[400px] h-[550px] bg-white rounded-[2rem] shadow-2xl border border-silver/50 flex flex-col overflow-hidden z-[100]"
    >
      {/* Header */}
      <div className="bg-ink p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-ink"></div>
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">{user.name}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{user.type} • Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8F9FA] no-scrollbar"
      >
        <div className="text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-gray-100">
                Today 10:00 AM
            </span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex items-end gap-3", msg.isMe ? "flex-row-reverse" : "flex-row")}>
            {!msg.isMe && <img src={user.avatar} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" referrerPolicy="no-referrer" />}
            <div className={cn(
              "max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed",
              msg.isMe 
                ? "bg-cobalt text-white rounded-br-none shadow-lg shadow-cobalt/20" 
                : "bg-white text-ink rounded-bl-none shadow-sm border border-silver/30"
            )}>
              {msg.text}
              <div className={cn("text-[9px] mt-2 font-bold", msg.isMe ? "text-white/50" : "text-gray-400")}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-silver/30">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-silver/50 group focus-within:border-cobalt transition-colors">
          <button className="p-2 text-gray-400 hover:text-cobalt transition-colors">
            <Smile size={20} />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-ink placeholder:text-gray-400"
          />
          <button className="p-2 text-gray-400 hover:text-cobalt transition-colors">
            <Paperclip size={20} />
          </button>
          <button 
            onClick={handleSend}
            className={cn(
                "p-3 rounded-xl transition-all",
                input.trim() ? "bg-cobalt text-white shadow-lg shadow-cobalt/30 scale-100" : "bg-gray-200 text-gray-400 scale-90"
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

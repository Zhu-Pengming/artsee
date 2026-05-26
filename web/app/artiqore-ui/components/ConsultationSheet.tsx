// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, MessageCircle, Phone, Calendar, Sparkles, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatDetail, PhoneDetail } from './ConsultationChannels';

interface ConsultationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
}

export const ConsultationSheet = ({ isOpen, onClose, institutionName }: ConsultationSheetProps) => {
  const [step, setStep] = useState(1);
  const [activeChannel, setActiveChannel] = useState<'chat' | 'phone' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    major: '',
    level: 'undergraduate',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-md z-[100]"
          />

          {/* Sheet - PC Responsive (Side Panel) / Mobile (Bottom Up or Full Screen) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-6 md:px-10 md:py-10 border-b border-silver/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-serif font-black italic text-ink">咨询录取顾问</h3>
                <p className="text-[10px] text-ink/30 uppercase font-black tracking-widest mt-1">Direct Connection to {institutionName}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full hover:bg-porcelain flex items-center justify-center transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              <AnimatePresence mode="wait">
                {activeChannel === 'chat' ? (
                  <ChatDetail 
                    key="chat"
                    institutionName={institutionName} 
                    onBack={() => setActiveChannel(null)} 
                  />
                ) : activeChannel === 'phone' ? (
                  <PhoneDetail 
                    key="phone"
                    institutionName={institutionName} 
                    onBack={() => setActiveChannel(null)} 
                  />
                ) : step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="px-6 py-8 md:px-10 md:py-12 space-y-10"
                  >
                    {/* Advisor Intro */}
                    <div className="bg-porcelain/50 rounded-3xl p-6 md:p-8 flex items-center gap-6 border border-silver/10">
                      <div className="relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cobalt/10 flex items-center justify-center text-cobalt overflow-hidden">
                          <User size={32} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
                      </div>
                      <div>
                        <h4 className="text-base md:text-lg font-bold text-ink">Senior Advisor: Sarah</h4>
                        <p className="text-xs text-ink/40 font-medium mt-1">5+ 年 {institutionName} 录取经验，曾协助 200+ 创作者拿回 Offer。</p>
                      </div>
                    </div>

                    {/* Quick Channels */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: <MessageCircle size={20} />, label: '在线聊聊', key: 'chat' as const, color: 'bg-emerald-50 text-emerald-600' },
                        { icon: <Phone size={20} />, label: '电话连线', key: 'phone' as const, color: 'bg-blue-50 text-blue-600' },
                      ].map((channel, i) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveChannel(channel.key)}
                          className={cn("p-6 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95", channel.color)}
                        >
                          {channel.icon}
                          <span className="text-[10px] font-bold uppercase tracking-widest">{channel.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-ink/10">
                      <div className="h-px flex-1 bg-current" />
                      <span className="text-[9px] font-black uppercase tracking-widest">或 填写需求</span>
                      <div className="h-px flex-1 bg-current" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-ink/40 uppercase tracking-widest px-1">真实姓名 / Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full h-14 md:h-16 px-6 bg-porcelain rounded-xl md:rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-cobalt/20 border border-transparent focus:border-cobalt/30 transition-all text-sm font-medium" 
                          placeholder="如何称呼您"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-ink/40 uppercase tracking-widest px-1">联系电话 / Cellphone</label>
                        <input 
                          type="tel" 
                          required
                          className="w-full h-14 md:h-16 px-6 bg-porcelain rounded-xl md:rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-cobalt/20 border border-transparent focus:border-cobalt/30 transition-all text-sm font-medium" 
                          placeholder="方便我们回电的号码"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-ink/40 uppercase tracking-widest px-1">意向专业 / Target Major</label>
                        <select className="w-full h-14 md:h-16 px-6 bg-porcelain rounded-xl md:rounded-2xl outline-none appearance-none cursor-pointer border border-transparent focus:border-cobalt/30 transition-all text-sm font-medium">
                          <option>交互设计 (Interaction Design)</option>
                          <option>视觉传达 (Visual Communication)</option>
                          <option>纯艺术 (Fine Arts)</option>
                          <option>其他专业 (Others)</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        className="w-full h-16 md:h-20 bg-ink text-white rounded-xl md:rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-cobalt transition-all shadow-xl shadow-ink/20 flex items-center justify-center gap-3"
                      >
                        提交咨询需求 <ArrowRight size={14} />
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-8"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                      <CheckCircle size={60} />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif font-black italic text-ink">需求提交成功</h3>
                      <p className="text-sm text-ink/40 leading-relaxed italic max-w-sm mx-auto">
                        录取顾问 Sarah 将在 15 分钟内与您取得联系。您可以先准备好目前的作品集草稿或个人简介。
                      </p>
                    </div>
                    <button 
                      onClick={onClose}
                      className="px-12 py-5 border-2 border-silver/30 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-ink transition-all"
                    >
                      明白，稍后再说
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-silver/10 bg-porcelain/30">
               <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-silver/10">
                  <div className="w-10 h-10 rounded-xl bg-cobalt/5 flex items-center justify-center text-cobalt">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-ink uppercase tracking-widest">智能预估</p>
                    <p className="text-[9px] text-ink/40 font-medium">当前该校咨询繁忙度：低（回复速度较快）</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, Calendar, Users, CreditCard, ShieldCheck, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookingFlowViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const BookingFlowView = ({ onBack, onSuccess }: BookingFlowViewProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('2026.05.15');
  const [guests, setGuests] = useState(1);

  const steps = [
    { id: 1, title: '选择日期与人数' },
    { id: 2, title: '确认会员权益' },
    { id: 3, title: '安全支付' },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-cobalt antialiased">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 px-6 flex items-center justify-between z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60">
          <X size={20} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Step 0{step} / 03</span>
        <div className="w-8" />
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 inset-x-0 h-12 px-12 items-center justify-between z-50">
        <button onClick={onBack} className="flex items-center gap-4 group">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-ink transition-all">
            <ChevronLeft size={16} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">Back to Experience</span>
        </button>
        
        <div className="flex items-center gap-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border transition-all",
                step >= s.id ? "bg-cobalt border-cobalt text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-white/5 border-white/10 text-white/20"
              )}>
                {step > s.id ? <Check size={10} /> : s.id}
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                step >= s.id ? "text-white" : "text-white/20"
              )}>{s.title}</span>
              {i < steps.length - 1 && <div className="w-6 h-[1px] bg-white/5" />}
            </div>
          ))}
        </div>

        <div className="w-32" />
      </header>

      <main className="pt-24 md:pt-24 pb-32 px-6">
        <div className="max-w-4xl md:max-w-2xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-12 md:space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12 md:space-y-6"
                >
                  <div className="space-y-4 md:space-y-2">
                    <h1 className="text-3xl md:text-2xl font-serif font-black italic">预定您的席位</h1>
                    <p className="text-sm md:text-xs text-white/40 font-light italic leading-relaxed">
                      请选择行程日期及参与人数，我们将为您锁定 L-Chain 验证节点。
                    </p>
                  </div>

                  <div className="space-y-8 md:space-y-6">
                    <div className="space-y-4 md:space-y-2">
                      <label className="text-[10px] md:text-[8px] font-black uppercase tracking-[0.4em] text-cobalt flex items-center gap-3 md:gap-2">
                        <Calendar size={14} /> Available Dates
                      </label>
                      <div className="grid grid-cols-2 gap-4 md:gap-3">
                        {['2026.05.15', '2026.06.12'].map(date => (
                          <button 
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                              "p-6 md:p-4 rounded-3xl md:rounded-2xl border transition-all text-left group",
                              selectedDate === date ? "bg-white text-ink border-white" : "bg-white/5 border-white/5 hover:border-white/20"
                            )}
                          >
                            <span className={cn("text-[10px] md:text-[8px] font-black uppercase tracking-widest block mb-2 md:mb-1", selectedDate === date ? "text-ink/40" : "text-white/20")}>Starting Date</span>
                            <span className="text-lg md:text-base font-serif font-bold italic">{date}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-2">
                      <label className="text-[10px] md:text-[8px] font-black uppercase tracking-[0.4em] text-cobalt flex items-center gap-3 md:gap-2">
                        <Users size={14} /> Number of Guests
                      </label>
                      <div className="flex items-center gap-8 md:gap-4 p-8 md:p-4 bg-white/5 rounded-[2.5rem] md:rounded-[1.5rem] border border-white/5">
                        <button 
                          onClick={() => setGuests(Math.max(1, guests-1))}
                          className="w-12 h-12 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-ink transition-colors"
                        >-</button>
                        <span className="text-4xl md:text-2xl font-serif italic font-black">{guests}</span>
                        <button 
                          onClick={() => setGuests(guests+1)}
                          className="w-12 h-12 md:w-8 md:h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-ink transition-colors"
                        >+</button>
                        <span className="ml-auto text-[10px] md:text-[8px] font-black uppercase tracking-widest text-white/20">Slots Selected</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-serif font-black italic">会员权益确认</h1>
                    <p className="text-xs md:text-sm text-white/40 font-light italic leading-relaxed">
                      基于您的 Articore Score，本次行程已自动应用以下高级权益。
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {[
                      { title: '全程专车接送', val: 'Elite Tier', desc: '配备专属司导及艺术解说员' },
                      { title: '顶级客房升舱', val: 'Verified Perk', desc: '视当日房态免费升级至行政套房' },
                      { title: '私人策展相册', val: 'Complimentary', desc: '全程摄影师精修底片 30 张' }
                    ].map((perk, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                        <div className="space-y-0.5">
                          <h4 className="text-base font-bold italic">{perk.title}</h4>
                          <p className="text-[10px] text-white/30 font-light italic">{perk.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-widest text-cobalt">{perk.val}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-serif font-black italic">完成最终预定</h1>
                    <p className="text-xs md:text-sm text-white/40 font-light italic leading-relaxed">
                      支付过程由 L-Chain 节点加密保护，确保您的身份与资金安全。
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-cobalt/5 border border-cobalt/20 rounded-[1.5rem] flex items-center gap-4">
                      <div className="w-12 h-12 bg-cobalt rounded-xl flex items-center justify-center text-white shadow-lg shadow-cobalt/10">
                        <CreditCard size={24} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cobalt">Secure Tunnel Active</p>
                        <p className="text-xs font-bold italic">加密支付通道已建立</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {['Apple Pay', 'Alipay', 'L-Credit', 'Card'].map(method => (
                        <button key={method} className="p-4 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white hover:text-ink hover:border-white transition-all">
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-8 border-t border-white/5">
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 md:py-5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Previous Phase
                </button>
              )}
              <button 
                onClick={handleNext}
                className="flex-[2] py-4 md:py-5 bg-white text-ink rounded-xl text-[9px] font-black uppercase tracking-[0.4em] hover:bg-cobalt hover:text-white transition-all shadow-xl active:scale-95"
              >
                {step === 3 ? 'Confirm Order' : 'Next Strategic Phase'}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary (Visible mainly on Desktop) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-6 md:p-8 bg-white/5 rounded-[2rem] border border-white/10 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                 <ShieldCheck size={20} className="text-emerald-500 opacity-20" />
              </div>
              
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 block border-b border-white/5 pb-3">Order Summary</span>
                
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Experience</p>
                      <h4 className="text-lg md:text-xl font-serif italic font-black">精品旅拍：星级酒店之旅</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Start Date</p>
                      <p className="text-xs font-bold italic">{selectedDate}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Guests</p>
                      <p className="text-xs font-bold italic">{guests} Person</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
                      <span>Base Price</span>
                      <span>¥2,880.00</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                      <span>Articore Member Discount</span>
                      <span>- ¥280.00</span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Total Secure Payment</span>
                      <span className="text-2xl font-serif font-black italic">¥{(2880 * guests - 280).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 leading-none">Registration Space Locked</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Status Footer */}
      <footer className="fixed bottom-0 inset-x-0 h-10 px-8 flex items-center justify-between z-40 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 italic">Validated by L-Chain Authority</span>
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">2026 Articore Platform</span>
      </footer>
    </div>
  );
};

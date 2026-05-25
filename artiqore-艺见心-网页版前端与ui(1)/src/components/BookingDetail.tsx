import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CreditCard, Wallet, Apple, ChevronRight, CheckCircle2, Sparkles, Clock, Globe, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookingDetailProps {
  event: { 
    title: string; 
    price: string;
    clubName: string;
    date: string;
  };
  onClose: () => void;
}

export const BookingDetail = ({ event, onClose }: BookingDetailProps) => {
  const [step, setStep] = useState<'selection' | 'payment' | 'success'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | 'apple'>('wechat');

  const paymentMethods = [
    { id: 'wechat' as const, name: '微信支付', icon: <Wallet size={20} className="text-green-500" />, color: 'bg-green-50' },
    { id: 'alipay' as const, name: '支付宝', icon: <Globe size={20} className="text-blue-500" />, color: 'bg-blue-50' },
    { id: 'apple' as const, name: 'Apple Pay', icon: <Apple size={20} className="text-ink" />, color: 'bg-porcelain' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-ink/90 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
      >
        {/* Left Side: Event Summary (Desktop) */}
        <div className="hidden md:flex md:w-1/3 bg-porcelain p-12 flex-col justify-between border-r border-silver/20">
          <div className="space-y-8">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border border-silver/20 flex items-center justify-center text-ink/40 hover:text-ink transition-all"
            >
              <X size={18} />
            </button>
            
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cobalt">{event.clubName}</span>
              <h2 className="text-3xl font-serif font-black italic text-ink leading-tight">{event.title}</h2>
              <div className="flex items-center gap-2 text-ink/40 font-bold text-xs">
                <Clock size={14} /> {event.date}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-silver/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink/40 uppercase tracking-widest">Entry Fee</span>
                <span className="text-2xl font-serif font-black italic text-ink">{event.price}</span>
              </div>
              <div className="h-[1px] bg-silver/10" />
              <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                <Sparkles size={14} /> Unlimited Slots Available
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-ink/20">
              <ShieldCheck size={24} />
              <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                ARTIQORE 会员保障计划<br />官方直售 · 100% 真实席位
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Flow */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-16">
          <AnimatePresence mode="wait">
            {step === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-serif font-black italic text-ink">预定席位</h3>
                  <p className="text-sm text-ink/40 font-bold uppercase tracking-widest">Select your payment method</p>
                </div>

                <div className="grid gap-4">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "w-full p-6 md:p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between group",
                        paymentMethod === method.id 
                          ? "border-cobalt bg-cobalt/5 shadow-xl shadow-cobalt/5" 
                          : "border-silver/20 hover:border-ink/20"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", method.color)}>
                          {method.icon}
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-black text-ink italic">{method.name}</p>
                          <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest">Instant Confirmation</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                        paymentMethod === method.id ? "bg-cobalt border-cobalt text-white" : "border-silver/20"
                      )}>
                        {paymentMethod === method.id && <CheckCircle2 size={16} />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-porcelain rounded-2xl text-[10px] font-bold text-ink/40 leading-loose italic">
                    * 预定即代表您已同意《ARTI QORE 线下活动免责声明》及《会员隐私协议》。该活动席位一旦成交，除非因主办方原因取消，否则不予退换。
                  </div>
                  
                  <button 
                    onClick={() => setStep('payment')}
                    className="w-full h-24 bg-cobalt text-white rounded-[2rem] flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em] shadow-3xl shadow-cobalt/20 hover:bg-ink transition-all active:scale-[0.98]"
                  >
                    确认并支付 {event.price}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-12 py-20"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-4 border-cobalt/10 border-t-cobalt"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-cobalt">
                    <ShieldCheck size={40} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-black italic text-ink">安全支付对接中...</h3>
                  <p className="text-sm text-ink/40 font-bold uppercase tracking-widest leading-relaxed">
                    正在加密连接至 {paymentMethods.find(m => m.id === paymentMethod)?.name}<br />
                    请勿刷新或关闭窗口
                  </p>
                </div>

                <button 
                  onClick={() => setStep('success')}
                  className="px-12 py-4 bg-porcelain rounded-full text-[10px] font-black uppercase tracking-widest text-ink/20 hover:text-ink transition-colors"
                >
                  模拟支付成功 (DEBUG)
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-12 py-20"
              >
                <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring", damping: 12 }}
                   className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/40"
                >
                  <CheckCircle2 size={60} />
                </motion.div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-serif font-black italic text-ink">预定成功</h3>
                  <p className="text-sm text-ink/40 font-bold uppercase tracking-widest leading-relaxed px-12">
                     恭喜！您已成功获得进入 {event.clubName} 的专属邀请。<br />
                     电子票据已发送至您的 ARTIQORE 邮箱及灵感首页。
                  </p>
                </div>

                <div className="grid gap-4 w-full">
                  <button className="w-full h-20 bg-ink text-white rounded-2xl text-xs font-bold uppercase tracking-[0.4em] shadow-xl">
                    查看电子邀请函
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full h-20 bg-porcelain text-ink/60 rounded-2xl text-xs font-bold uppercase tracking-[0.4em]"
                  >
                    回到沙龙详情
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

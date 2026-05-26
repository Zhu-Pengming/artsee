// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShieldCheck, Wallet, QrCode, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  amount?: string;
  itemTitle?: string;
  onSuccess?: () => void;
}

export const PaymentSheet = ({ 
  isOpen, 
  onClose, 
  title = "确认艺术支付", 
  amount = "¥9.90", 
  itemTitle = "专栏订阅服务",
  onSuccess 
}: PaymentSheetProps) => {
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'alipay' | 'wechat' | null>(null);
  const [error, setError] = useState('');
  const [orderNo, setOrderNo] = useState('');

  const paymentMethods = [
    { 
      id: 'alipay', 
      name: '支付宝', 
      icon: 'https://cdn-icons-png.flaticon.com/512/349/349221.png', 
      color: 'bg-[#1677FF]',
      desc: '支持花呗 / 信用卡'
    },
    { 
      id: 'wechat', 
      name: '微信支付', 
      icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', 
      color: 'bg-[#07C160]',
      desc: '零钱 / 银行卡快捷支付'
    },
  ];

  const parseAmountToCents = (raw: string) => {
    const normalized = raw.replace(/[^\d.]/g, '');
    const value = Number.parseFloat(normalized || '0');
    return Math.max(1, Math.round(value * 100));
  };

  const handlePay = async () => {
    if (!selectedMethod) return;
    setStep('processing');
    setError('');
    setOrderNo('');

    try {
      const token = typeof window !== 'undefined'
        ? window.localStorage.getItem('artiqore_access_token') || window.localStorage.getItem('access_token') || ''
        : '';
      const response = await fetch('/api/v1/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: itemTitle || title,
          amountTotal: parseAmountToCents(amount),
          currency: 'cny',
          itemType: 'web_ui_payment',
          metadata: {
            title,
            amount,
            itemTitle,
            selectedMethod,
            source: 'artiqore-web-payment-sheet',
          },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body?.success !== true) {
        throw new Error(body?.error || body?.message || '订单创建失败');
      }
      setOrderNo(body?.data?.orderNo || body?.data?.order?.order_no || '');
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep('method');
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep('method');
      setSelectedMethod(null);
      setError('');
      setOrderNo('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[101] shadow-2xl p-8 lg:p-16"
          >
            <div className="max-w-xl mx-auto space-y-8">
              {/* Close Button */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-cobalt/10 rounded-xl flex items-center justify-center text-cobalt">
                      <Wallet size={20} />
                   </div>
                   <div>
                     <h3 className="text-xl font-serif font-bold text-ink italic">{title}</h3>
                     <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest leading-none mt-1">Secure Art Payment</p>
                   </div>
                </div>
                <button onClick={resetAndClose} className="p-2 bg-silver/20 rounded-full hover:bg-silver/40 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {step === 'method' && (
                <div className="space-y-8">
                  {/* Amount Card */}
                  <div className="bg-[#f8f8f8] p-8 rounded-[2rem] text-center border border-silver/30 relative overflow-hidden">
                     <div className="relative z-10">
                        <p className="text-[10px] text-ink/40 font-bold uppercase tracking-[0.2em] mb-2">{itemTitle}</p>
                        <h4 className="text-4xl font-serif font-bold text-ink italic tracking-tighter">{amount}</h4>
                     </div>
                     <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-ink/[0.02] -rotate-12" />
                  </div>

                  {/* Methods */}
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <button 
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id as any)}
                        className={cn(
                          "w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group",
                          selectedMethod === method.id ? "border-cobalt bg-cobalt/5 shadow-lg shadow-cobalt/5" : "border-silver/30 hover:border-silver/60"
                        )}
                      >
                         <div className="flex items-center gap-4">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center p-3 shadow-md", method.color)}>
                               <img src={method.icon} className="w-full h-full object-contain brightness-0 invert" alt={method.name} />
                            </div>
                            <div className="text-left">
                               <p className="text-[14px] font-bold text-ink italic leading-tight">{method.name}</p>
                               <p className="text-[10px] text-ink/30 font-medium mt-1">{method.desc}</p>
                            </div>
                         </div>
                         <div className={cn(
                           "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                           selectedMethod === method.id ? "bg-cobalt border-cobalt" : "border-silver/40"
                         )}>
                            {selectedMethod === method.id && <Check size={14} className="text-white" />}
                         </div>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handlePay}
                    disabled={!selectedMethod}
                    className="w-full h-16 bg-ink text-white rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-xs hover:bg-cobalt transition-all shadow-xl shadow-ink/10 disabled:opacity-30 active:scale-95 translate-y-0"
                  >
                     <CreditCard size={18} />
                     创建订单 (Create Order)
                  </button>
                  {error && (
                    <p className="text-center text-[11px] text-red-500 font-bold tracking-wide">
                      {error === '未授权' ? '请先登录后再创建订单' : error}
                    </p>
                  )}
                  <p className="text-center text-[10px] text-ink/20 uppercase tracking-widest font-black">Powered by artiqore Security Engine</p>
                </div>
              )}

              {step === 'processing' && (
                <div className="py-20 flex flex-col items-center justify-center space-y-8">
                   <div className="relative">
                      <div className="w-24 h-24 border-4 border-silver/30 border-t-cobalt rounded-full animate-spin" />
                      <QrCode size={24} className="absolute inset-0 m-auto text-cobalt animate-pulse" />
                   </div>
                   <div className="text-center space-y-2">
                      <h4 className="text-xl font-serif font-bold italic text-ink">正在创建订单</h4>
                      <p className="text-[10px] text-ink/30 uppercase tracking-widest font-black animate-pulse">Internal Checkout in progress</p>
                   </div>
                </div>
              )}

              {step === 'success' && (
                <div className="py-20 flex flex-col items-center justify-center space-y-8">
                   <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-green-200">
                      <Check size={48} strokeWidth={3} className="animate-bounce" />
                   </div>
                   <div className="text-center space-y-2">
                      <h4 className="text-xl font-serif font-bold italic text-ink">订单已创建</h4>
                      <p className="text-[10px] text-ink/30 uppercase tracking-widest font-black">
                        {orderNo ? `Order ${orderNo}` : 'Internal order created'}
                      </p>
                   </div>
                   <button 
                    onClick={resetAndClose}
                    className="px-12 py-4 bg-ink text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-cobalt transition-all"
                   >
                     返回页面 (CONTINUE)
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

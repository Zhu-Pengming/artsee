// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  shareUrl?: string;
  itemTitle?: string;
}

export const ShareSheet = ({ isOpen, onClose, title = "分享艺术感悟", shareUrl, itemTitle }: ShareSheetProps) => {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    { name: '微信', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', color: 'bg-green-50' },
    { name: '朋友圈', icon: 'https://cdn-icons-png.flaticon.com/512/2108/2108620.png', color: 'bg-green-100' },
    { name: '微博', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111710.png', color: 'bg-red-50' },
    { name: '小红书', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670183.png', color: 'bg-red-100' },
  ];

  const handleCopyLink = () => {
    const url = shareUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[101] shadow-2xl p-10 lg:p-16"
          >
            <div className="max-w-xl mx-auto space-y-12">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold text-ink italic">{title}</h3>
                  {itemTitle && (
                    <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest">{itemTitle}</p>
                  )}
                </div>
                <button onClick={onClose} className="p-2 bg-silver/20 rounded-full hover:bg-silver/40 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-8">
                {shareOptions.map((opt) => (
                  <button key={opt.name} className="flex flex-col items-center gap-3 group">
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm shadow-ink/5", opt.color)}>
                      <img src={opt.icon} alt={opt.name} className="w-10 h-10 object-contain transition-all" />
                    </div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">{opt.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-silver/30">
                <button 
                  onClick={handleCopyLink}
                  className="w-full h-16 bg-porcelain rounded-2xl flex items-center px-6 justify-between group hover:bg-silver/20 transition-all border border-silver/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-cobalt shadow-sm">
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </div>
                    <span className="text-xs font-bold text-ink/60 uppercase tracking-widest">
                      {copied ? '已复制链接' : '复制内容链接'}
                    </span>
                  </div>
                  <ExternalLink size={18} className="text-ink/20 group-hover:text-cobalt transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

'use client'

import { motion } from "motion/react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";

export function Hero() {
  const t = useTranslations('hero');
  return (
    <section className="relative min-h-[calc(100dvh-6rem)] flex items-center px-6 md:px-12 lg:px-24 py-12 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 z-10"
        >
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-secondary mb-6 block">
            {t('eyebrow')}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold font-headline leading-[0.95] tracking-tight text-on-surface mb-8 whitespace-pre-line">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed mb-10 font-light">
            {t('description')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/explore"
              className="bg-primary hover:bg-primary-dim text-on-primary px-8 py-4 rounded-md font-medium transition-all shadow-lg shadow-primary/10"
            >
              {t('exploreCollection')}
            </Link>
            <Link
              href="/learn"
              className="border border-outline-variant/30 hover:border-primary text-primary px-8 py-4 rounded-md font-medium transition-all"
            >
              {t('ourThesis')}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-6 relative flex items-center justify-center"
        >
          <div className="h-[calc(100dvh-16rem)] aspect-[4/5] bg-surface-container-high overflow-hidden rounded-lg shadow-2xl mx-auto">
            <img
              alt="Art Installation"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxQKeFjsLT-QtLUzvZQe-bd7B-DkkoCaI7ChavsudNPAAIrKE8H63W5lTGbcjl1jM_p-SL7dMuWm9ifYP10_b5t8xUQncVt_L-nDO1OU8iSHQVecPS2kRXqudKFDGDsAgVHFiB-cjxC4XMtDZRRDi1ll09nlglXckWdK7X-yrzVfZynLa78s_M3KAuJ0ANReeEGU34H7YLgYT_f8EG9O8i6br-FbDoU3tVp941ZwrWicSU__lFXMfRi6Smo3yzYUCMDwIIuzBKhbHe"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-6 -left-4 md:-left-8 bg-surface-container-lowest p-6 md:p-8 shadow-ambient max-w-xs rounded-md border border-outline-variant/10"
          >
            <p className="text-sm italic font-medium mb-2">{t('quote')}</p>
            <p className="text-[10px] uppercase tracking-widest text-secondary">— {t('quoteAuthor')}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

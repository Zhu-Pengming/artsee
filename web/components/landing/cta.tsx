'use client'

import { motion } from "motion/react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";

export function CTA() {
  const t = useTranslations('cta');
  return (
    <section className="min-h-[calc(100dvh-6rem)] flex items-center justify-center py-16 lg:py-20 px-6 md:px-12 lg:px-24 relative overflow-hidden text-center">
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-surface-container-low to-surface-container-highest opacity-50"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold mb-8 lg:mb-10 tracking-tight whitespace-pre-line"
        >
          {t('title')}
        </motion.h2>
        <p className="text-lg md:text-xl text-on-surface-variant mb-10 lg:mb-12 max-w-2xl mx-auto font-light">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/auth/login" className="inline-flex justify-center bg-primary text-on-primary px-10 lg:px-12 py-4 lg:py-5 rounded-md font-bold text-lg hover:bg-primary-dim transition-all shadow-xl shadow-primary/20">
            {t('apply')}
          </Link>
          <Link href="/collab" className="inline-flex justify-center bg-surface-container-lowest border border-outline-variant/30 text-on-surface px-10 lg:px-12 py-4 lg:py-5 rounded-md font-bold text-lg hover:border-primary transition-all">
            {t('inquiry')}
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client'

import { motion } from "motion/react";
import { GraduationCap, Brain, TrendingUp, ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";

export function Learn() {
  const t = useTranslations('learn');
  return (
    <section className="bg-surface-container min-h-[calc(100dvh-6rem)] flex items-center py-16 lg:py-20 px-6 md:px-12 lg:px-24">
      <div className="w-full">
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl font-headline font-bold mb-6">{t('title')}</h2>
          <p className="text-on-surface-variant">{t('description')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="lg:col-span-2 p-8 md:p-10 lg:p-12 bg-surface-container-lowest rounded-md shadow-ambient border border-outline-variant/10 flex flex-col justify-between"
          >
            <div>
              <GraduationCap className="w-10 h-10 text-secondary mb-6 lg:mb-8" />
              <h3 className="text-2xl font-headline font-bold mb-4">{t('educationTitle')}</h3>
              <p className="text-on-surface-variant mb-6 lg:mb-8">{t('educationDesc')}</p>
            </div>
            <Link className="inline-flex items-center gap-2 text-primary font-bold group" href="/learn">
              {t('exploreCurriculum')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 md:p-10 lg:p-12 bg-surface-container-lowest rounded-md shadow-ambient border border-outline-variant/10 hover:bg-primary hover:text-on-primary transition-all group"
          >
            <Brain className="w-10 h-10 text-secondary group-hover:text-on-primary mb-6 lg:mb-8 transition-colors" />
            <h3 className="text-xl font-headline font-bold mb-4">{t('mentorshipTitle')}</h3>
            <p className="text-sm text-on-surface-variant group-hover:text-on-primary/80 mb-4 lg:mb-6">{t('mentorshipDesc')}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 md:p-10 lg:p-12 bg-surface-container-lowest rounded-md shadow-ambient border border-outline-variant/10 hover:bg-primary hover:text-on-primary transition-all group"
          >
            <TrendingUp className="w-10 h-10 text-secondary group-hover:text-on-primary mb-6 lg:mb-8 transition-colors" />
            <h3 className="text-xl font-headline font-bold mb-4">{t('marketTitle')}</h3>
            <p className="text-sm text-on-surface-variant group-hover:text-on-primary/80 mb-4 lg:mb-6">{t('marketDesc')}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

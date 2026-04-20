'use client'

import { motion } from "motion/react";
import { Diamond, Layers } from "lucide-react";
import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";

export function Collaborate() {
  const t = useTranslations('collaborate');
  return (
    <section className="min-h-[calc(100dvh-6rem)] flex items-center py-16 lg:py-20 px-6 md:px-12 lg:px-24">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="order-2 lg:order-1 h-[calc(100dvh-18rem)]">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="space-y-4 h-full flex flex-col">
              <motion.div whileHover={{ scale: 1.02 }} className="flex-1 bg-surface-container-high rounded-md overflow-hidden shadow-lg">
                <img alt="Hotel Interior" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbxdakJR2chD7sc6vRveOLNpb15c7u37oTAho0ogu0kUhOMu2uU41OmAfxvMx1tHVd7SFoOuCZ2txhaR2i1cE59oBKQWy2Md1gNMntfKNJINN77xkU81DWouKSXrUYnrY36rnTTf10amPy5t93ErJh29gUwEsGF3vsAeTsCkWYRkPGLO1CC0MsbWNjxj8fjxl3-UqjdONLABctXbccrkjJ2uY3ukRpdgbVYmMuBNbOwGnDfD-2gqYbf9ixsq4v6SEVj4UEFo2tMdqM" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="flex-1 bg-surface-container-high rounded-md overflow-hidden shadow-lg">
                <img alt="Art Detail" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI4ZpXmgcAMkW_BjSS2EAsVL5wa57vd6VcLJJqjMCUq89FBMhU-gxg_9u4KfE8ED1w29Hzz9c5vRboyhwCktbpD0UKUvgLCbgka3bHPKGlfqgNecN4zAotOXlOQea8dLCXNfyon80FvZc_zXaYZCLJOuUErbqiazyrLZcyqlcKqqKp-GUdohU7THycqJ02GJLfrPhwTVdauOTmuR-9oIK_VFBMZN_TIFzVqdHAlu00rRQ1R0C44b-PiNrVU5oR7no_DGz-OgP1O4yD" />
              </motion.div>
            </div>
            <div className="pt-8 lg:pt-12 space-y-4 h-full flex flex-col">
              <motion.div whileHover={{ scale: 1.02 }} className="flex-1 bg-surface-container-high rounded-md overflow-hidden shadow-lg">
                <img alt="Corporate Office" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Q2ASi3EbyUs7tE3LCi-nVri_eqzlbQ5xOFABT_YPoak8Q4vvB-fLH-OHWh7cbDGEMRbeHxktQzaL5wrJO9H2gnOmfUUBiLdrIEfxmd9TEsbZYzTSoeb2FLDjUmSTySdiENzZfcjCxxtaKI9xlEstoBAguIdcvD8XHkHOTq5k4TO_nHC6nKPwBVBN3NwVLjm9opdEn7c5zsyyab1mgVr_Y61gNfVV2Hz6tzjeZcVAmSu0JcX0VxryKQophOrHHptlCXOgb8bKTqxF" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="flex-1 bg-surface-container-high rounded-md overflow-hidden shadow-lg">
                <img alt="Gallery Event" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhxtQEEja5eyN_eOBkKyQGIp26jYb9SS5CF1-9HCFBF2RjZsBcrDKUFPCGHr0x_rmTGBA_6zL6_xCn64UoAGZugkQymlLBZ4pyaFJYE48uefs7wdahkScKVKaNLlEgZARORBeqA80jYaQsw6i9Gy2AYBRJhkzR1D5Vdz1qN79hEd12P-V8Cu3xdOzT2Fwzo-uaNjj7UPUx7MbDKoe0bXyuVQecjiGlbC8LGUCq-odTPQMJ9G5N2zfKWG5GKXT1UxZVpKnl1fZGDTEs" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <span className="text-secondary font-semibold uppercase tracking-[0.2em] text-xs mb-6 block">{t('eyebrow')}</span>
          <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface mb-8 leading-tight whitespace-pre-line">{t('title')}</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
            {t('description')}
          </p>
          <ul className="space-y-6 lg:space-y-8 mb-10 lg:mb-12">
            <li className="flex items-start gap-4">
              <div className="bg-secondary/10 p-2 rounded-md">
                <Diamond className="text-secondary w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{t('hospitalityTitle')}</h4>
                <p className="text-sm text-on-surface-variant">{t('hospitalityDesc')}</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-secondary/10 p-2 rounded-md">
                <Layers className="text-secondary w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface">{t('brandTitle')}</h4>
                <p className="text-sm text-on-surface-variant">{t('brandDesc')}</p>
              </div>
            </li>
          </ul>
          <Link href="/collab" className="inline-flex justify-center bg-primary text-on-primary px-10 py-4 rounded-md font-medium hover:bg-primary-dim transition-colors w-full sm:w-auto">
            {t('cta')}
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client'

import { useTranslations } from "@/components/i18n-provider";
import Link from "next/link";

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="w-full border-t border-outline-variant/10 bg-surface">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-12 w-full gap-8">
        <div className="font-headline font-bold text-lg text-on-surface">ArtLink</div>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-sans text-sm tracking-wide text-on-surface-variant/70">
          <Link className="hover:underline underline-offset-4 transition-opacity" href="/terms">{t('terms')}</Link>
          <Link className="hover:underline underline-offset-4 transition-opacity" href="/privacy">{t('privacy')}</Link>
          <Link className="hover:underline underline-offset-4 transition-opacity" href="/">{t('guidelines')}</Link>
          <Link className="hover:underline underline-offset-4 transition-opacity" href="/">{t('press')}</Link>
          <Link className="hover:underline underline-offset-4 transition-opacity" href="/">{t('contact')}</Link>
        </div>
        <p className="font-sans text-sm tracking-wide text-on-surface-variant">
          {t('copyright')}
        </p>
      </div>
    </footer>
  );
}

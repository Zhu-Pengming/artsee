'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from '@/components/i18n-provider';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (nextLocale: string) => {
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/`;
    setOpen(false);
    router.refresh();
  };

  const locales = [
    { code: 'zh', label: t('zh') },
    { code: 'en', label: t('en') },
    { code: 'ja', label: t('ja') },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-full text-primary hover:bg-primary/10 transition-colors"
        aria-label="Switch language"
      >
        <Globe className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-lg overflow-hidden z-50">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => handleChange(l.code)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                locale === l.code
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-on-surface hover:bg-primary/5'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

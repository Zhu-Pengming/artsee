'use client';

import { createContext, useContext } from 'react';

type Messages = Record<string, any>;

const I18nContext = createContext<{ locale: string; messages: Messages }>({
  locale: 'zh',
  messages: {},
});

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  return useContext(I18nContext).locale;
}

export function useTranslations(namespace?: string) {
  const { messages } = useContext(I18nContext);
  return function t(key: string): string {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const parts = fullKey.split('.');
    let value: any = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    return typeof value === 'string' ? value : fullKey;
  };
}

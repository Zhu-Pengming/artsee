import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['zh', 'en', 'ja'],
  defaultLocale: 'zh',
  localePrefix: 'never',
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

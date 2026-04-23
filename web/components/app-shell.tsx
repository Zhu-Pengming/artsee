'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === '/login' || pathname === '/auth/login';

  return (
    <>
      {!hideNav && <Navbar />}
      <main className={hideNav ? 'min-h-[90vh]' : 'pt-24 min-h-[90vh]'}>{children}</main>
      {!hideNav && <Footer />}
    </>
  );
}

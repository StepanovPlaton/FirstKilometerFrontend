import type { Metadata } from 'next';

import { Menu } from '@/features/menu';
import { PermissionsValidator } from '@/features/permissions';

export const metadata: Metadata = {
  title: 'Первый километр - Панель администратора',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full! w-full">
      <PermissionsValidator />
      <Menu />
      <div className="h-full w-[calc(100%-280px)]! overflow-auto bg-[var(--color-bg3)] py-8">
        {children}
      </div>
    </div>
  );
}

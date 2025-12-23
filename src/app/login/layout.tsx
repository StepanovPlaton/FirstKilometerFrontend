import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Первый километр - Панель администратора',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex h-full! w-full items-center justify-around">{children}</div>;
}

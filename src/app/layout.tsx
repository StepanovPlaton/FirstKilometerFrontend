import type { Metadata } from 'next';

import { App, ConfigProvider } from 'antd';

import { AntdRegistry } from '@ant-design/nextjs-registry';

import './globals.css';

import { Menu } from '@/features/menu';
import config from '@/shared/utils/theme';
import localFont from 'next/font/local';

const font = localFont({
  src: [
    {
      path: '../../public/font/geometria_medium.otf',
      weight: 'normal',
      style: 'normal',
    },
    {
      path: '../../public/font/geometria_mediumitalic.otf',
      weight: 'normal',
      style: 'italic',
    },
    {
      path: '../../public/font/geometria_bold.otf',
      weight: 'bold',
      style: 'normal',
    },
    {
      path: '../../public/font/geometria_bolditalic.otf',
      weight: 'bold',
      style: 'italic',
    },
    {
      path: '../../public/font/geometria_extrabold.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/font/geometria_light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/font/geometria_lightitalic.otf',
      weight: '300',
      style: 'italic',
    },
  ],
  variable: '--font',
});

export const metadata: Metadata = {
  title: 'Первый километр - Панель администратора',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} ${font.variable}`}>
        <AntdRegistry>
          <App>
            <ConfigProvider {...config}>
              <div className="flex h-full! w-full">
                <Menu />
                <div className="h-full w-[calc(100%-280px)]! overflow-auto bg-[var(--color-bg3)] py-8">
                  {children}
                </div>
              </div>
            </ConfigProvider>
          </App>
        </AntdRegistry>
      </body>
    </html>
  );
}

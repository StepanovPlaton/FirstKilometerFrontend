'use client';

import { Title } from '@/shared/ui/title';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import {
  BankOutlined,
  CarOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  IdcardOutlined,
  PlaySquareOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Divider, Flex, Space } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { usePathname, useRouter } from 'next/navigation';

const menu = [
  {
    href: '/',
    text: 'Создать новый договор',
    icon: <PlusOutlined />,
  },
  undefined,
  {
    href: '/tables/clients',
    text: 'Клиенты автосалона',
    icon: <UserOutlined />,
  },
  {
    href: '/tables/vehicles',
    text: 'Транспортные средства',
    icon: <CarOutlined />,
  },
  {
    href: '/tables/companies/internal',
    text: 'Филиалы',
    icon: <BankOutlined />,
  },
  {
    href: '/tables/companies/external',
    text: 'Юр. лица',
    icon: <DatabaseOutlined />,
  },
  {
    href: '/tables/individuals',
    text: 'Физ. лица',
    icon: <IdcardOutlined />,
  },
  undefined,
  {
    href: '/download',
    text: 'Сгенерировать договор',
    icon: <FileTextOutlined />,
  },
];

export const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuthTokens = useAuthTokens((s) => s.clear);

  return (
    <Sider width={280} className="min-h-full! bg-[var(--color-bg2)]!">
      <Space direction="vertical" className="p-2">
        <img
          src="/logo/short_logo.webp"
          className="cursor-pointer p-4"
          onClick={() => router.push('/')}
        />
        {menu.map((i, ind) =>
          !i ? (
            <Divider key={ind} className="m-1!" />
          ) : (
            <Button
              key={i.href}
              className="w-full"
              size="large"
              type={pathname === i.href ? 'primary' : 'default'}
              onClick={() => router.push(i.href)}
            >
              <Flex className="w-full" justify="start">
                <Title level={5} className={`align-start m-0! text-inherit!`}>
                  <Space>
                    {i.icon}
                    {i.text}
                  </Space>
                </Title>
              </Flex>
            </Button>
          )
        )}
      </Space>
      <Button
        danger
        className="absolute! right-4! bottom-4!"
        onClick={() => {
          clearAuthTokens();
          router.push('/login');
        }}
      >
        Выйти <PlaySquareOutlined />
      </Button>
    </Sider>
  );
};

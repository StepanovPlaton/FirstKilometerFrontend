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
} from '@ant-design/icons';
import { Button, Divider, Flex, Space } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { usePathname, useRouter } from 'next/navigation';

import Image from 'next/image';
import type { JSX } from 'react';

type MenuItem =
  | {
      href: string;
      text: string;
      icon: JSX.Element;
    }
  | undefined;

export const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuthTokens = useAuthTokens((s) => s.clear);
  const permissions = useAuthTokens((s) => s.permissions);

  const menu: MenuItem[] = [
    ...([
      'view_doc',
      'add_doc',
      'view_vehicle',
      'add_vehicle',
      'change_vehicle',
      'view_person',
      'add_person',
      'change_person',
      'view_internalcompany',
      'add_internalcompany',
      'change_internalcompany',
      'view_externalcompany',
      'add_externalcompany',
      'change_externalcompany',
    ].every((k) => permissions.includes(k))
      ? [
          {
            href: '/create',
            text: 'Создать новый договор',
            icon: <PlusOutlined />,
          },
        ]
      : []),
    undefined,
    ...(permissions.includes('view_vehicle')
      ? [
          {
            href: '/tables/vehicles',
            text: 'Транспортные средства',
            icon: <CarOutlined />,
          },
        ]
      : []),
    undefined,
    ...(permissions.includes('view_person')
      ? [
          {
            href: '/tables/individuals',
            text: 'Физ. лица',
            icon: <IdcardOutlined />,
          },
        ]
      : []),

    ...(permissions.includes('view_internalcompany')
      ? [
          {
            href: '/tables/companies/internal',
            text: 'Филиалы',
            icon: <BankOutlined />,
          },
        ]
      : []),
    ...(permissions.includes('view_externalcompany')
      ? [
          {
            href: '/tables/companies/external',
            text: 'Юр. лица',
            icon: <DatabaseOutlined />,
          },
        ]
      : []),
    undefined,
    ...(permissions.includes('add_doc')
      ? [
          {
            href: '/download',
            text: 'Сгенерировать договор',
            icon: <FileTextOutlined />,
          },
        ]
      : []),
  ];

  const additional: MenuItem[] = [
    {
      href: '/tables/articles',
      text: 'Категории артикулов',
      icon: <DatabaseOutlined />,
    },
  ];

  const drawMenu = (i: MenuItem, ind: number) =>
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
    );

  return (
    <Sider width={280} className="min-h-full! bg-[var(--color-bg2)]!">
      <Flex vertical justify="space-between" className="h-full">
        <Space direction="vertical" className="p-2">
          <Image
            src="/logo/short_logo.webp"
            alt="Первый километр"
            className="cursor-pointer p-4"
            onClick={() => router.push('/')}
            width={260}
            height={60}
          />
          {menu.map(drawMenu)}
        </Space>

        <Space direction="vertical" className="p-2">
          {additional.map(drawMenu)}
          <Flex className="w-full" justify="flex-end">
            <Button
              danger
              onClick={() => {
                clearAuthTokens();
                router.push('/login');
              }}
            >
              Выйти <PlaySquareOutlined />
            </Button>
          </Flex>
        </Space>
      </Flex>
    </Sider>
  );
};

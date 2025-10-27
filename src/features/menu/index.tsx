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

import Image from 'next/image';

export const Menu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuthTokens = useAuthTokens((s) => s.clear);
  const permissions = useAuthTokens((s) => s.permissions);

  const menu = [
    ...([
      'view_doc',
      'add_doc',
      'view_user',
      'add_user',
      'change_user',
      'view_vehicle',
      'add_vehicle',
      'change_vehicle',
      'view_individual',
      'add_individual',
      'change_individual',
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
    ...(permissions.includes('view_user')
      ? [
          {
            href: '/tables/clients',
            text: 'Клиенты автосалона',
            icon: <UserOutlined />,
          },
        ]
      : []),
    ...(permissions.includes('view_vehicle')
      ? [
          {
            href: '/tables/vehicles',
            text: 'Транспортные средства',
            icon: <CarOutlined />,
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
    ...(permissions.includes('view_individual')
      ? [
          {
            href: '/tables/individuals',
            text: 'Физ. лица',
            icon: <IdcardOutlined />,
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

  return (
    <Sider width={280} className="min-h-full! bg-[var(--color-bg2)]!">
      <Space direction="vertical" className="p-2">
        <Image
          src="/logo/short_logo.webp"
          alt="Первый километр"
          className="cursor-pointer p-4"
          onClick={() => router.push('/')}
          width={260}
          height={60}
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

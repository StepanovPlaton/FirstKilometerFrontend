'use client';

import { Title } from '@/shared/ui/title';
import {
  CarOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  IdcardOutlined,
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
    href: '/tables/companies',
    text: 'Компании',
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
    </Sider>
  );
};

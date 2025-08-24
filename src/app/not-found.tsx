import { Title } from '@/shared/ui/title';
import { Flex, Space, Spin } from 'antd';

export default function NotFound() {
  return (
    <Flex align="center" justify="space-around" className="h-full w-full">
      <Space align="center" size="large">
        <Spin spinning></Spin>
        <Title level={2} className="m-0!">
          Страница в разработке
        </Title>
      </Space>
    </Flex>
  );
}

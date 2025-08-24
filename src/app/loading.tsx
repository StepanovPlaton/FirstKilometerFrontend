import { Flex, Spin } from 'antd';

export default function Loading() {
  return (
    <Flex align="center" justify="space-around" className="h-full w-full">
      <Spin spinning></Spin>
    </Flex>
  );
}

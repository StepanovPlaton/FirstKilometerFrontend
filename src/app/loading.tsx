import { Flex, Spin } from 'antd';

export default function Loading() {
  return (
    <Flex align="center" justify="space-around">
      <Spin spinning></Spin>
    </Flex>
  );
}

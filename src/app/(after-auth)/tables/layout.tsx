import { Flex } from 'antd';
import Image from 'next/image';

export default function TablesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex vertical align="center" justify="space-evenly" className="w-full p-10!" gap={40}>
      <Image
        src="/logo/logo.webp"
        width={386}
        height={20}
        alt="Первый километр / автосалон"
        className="w-100"
      />
      <div className="flex w-full items-center justify-center">{children}</div>
    </Flex>
  );
}

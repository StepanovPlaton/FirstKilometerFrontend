import { Flex } from 'antd';
import Image from 'next/image';

export default function UploadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex vertical align="center" justify="space-evenly" className="w-full h-full">
      <Image
        src="/logo/logo.webp"
        width={386}
        height={20}
        alt="Первый километр / автосалон"
        className="w-100"
      />
      <div className="w-full flex items-center justify-center">{children}</div>
    </Flex>
  );
}

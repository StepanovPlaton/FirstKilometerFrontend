'use client';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Upload } from 'antd';
import type { RcFile } from 'antd/lib/upload';
import Image from 'next/image';
import { useState } from 'react';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
  });

export const UploadDocument = (props: { onUpload: (file: RcFile) => unknown; text: string }) => {
  const [previewImage, setPreviewImage] = useState('');

  return (
    <Upload
      showUploadList={false}
      beforeUpload={(file) => {
        void (async () => setPreviewImage(await getBase64(file)))();
        props.onUpload(file);
        return false;
      }}
      accept=".jpg,.png,.jpeg"
    >
      <Button type="dashed" className="h-40! w-40">
        {previewImage ? (
          <Image
            src={previewImage}
            height={190}
            width={190}
            alt={props.text}
            className="h-34! w-36! rounded object-cover"
          />
        ) : (
          <Space direction="vertical">
            <PlusOutlined />
            <div className="mt-4 text-wrap">{props.text}</div>
          </Space>
        )}
      </Button>
    </Upload>
  );
};

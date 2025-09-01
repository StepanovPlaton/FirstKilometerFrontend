'use client';

import { Text } from '@/shared/ui/text';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Space, Upload } from 'antd';
import type { RcFile } from 'antd/lib/upload';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PDFIcon } from './pdf-icon';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
  });

export const UploadDocument = (props: {
  onUpload: (file: RcFile) => unknown;
  text: string;
  file: RcFile | undefined;
}) => {
  const [previewImage, setPreviewImage] = useState<string | undefined>('');
  const [previewDoc, setPreviewDoc] = useState<string | undefined>('');
  const [file, setFile] = useState<RcFile>();

  useEffect(() => {
    if (props.file) {
      setFile(props.file);
    } else {
      setFile(undefined);
    }
  }, [props.file]);

  useEffect(() => {
    if (file) {
      if (file.type === 'application/pdf') {
        setPreviewDoc(file.name);
      } else {
        void (async () => setPreviewImage(await getBase64(file)))();
      }
    } else {
      setPreviewDoc(undefined);
      setPreviewImage(undefined);
    }
  }, [file]);

  return (
    <Upload
      showUploadList={false}
      beforeUpload={(file) => {
        props.onUpload(file);
        return false;
      }}
      accept=".jpg,.png,.jpeg,.pdf"
    >
      <Button type="dashed" className="h-42! w-42">
        {previewImage ? (
          <Image
            src={previewImage}
            height={190}
            width={190}
            alt={props.text}
            className="h-34! w-36! rounded object-cover"
          />
        ) : previewDoc ? (
          <Space direction="vertical" align="center">
            <PDFIcon />
            <Text className="block max-w-36 overflow-hidden overflow-ellipsis whitespace-nowrap">
              {previewDoc}
            </Text>
          </Space>
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

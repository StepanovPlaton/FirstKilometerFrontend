'use client';

import { FileImageOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Image, Skeleton } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

export const Viewer = (props: {
  active?: boolean;
  url: string | undefined | null;
  alt?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  pdfClassName?: string;
  skeletonClassName?: string;
}) => {
  const [rotate, setRotate] = useState(0);
  const [preview, setPreview] = useState(false);

  if (!props.active) {
    return <Skeleton.Node active className={props.skeletonClassName ?? ''} />;
  }
  if (props.url?.includes('.pdf')) {
    return (
      <iframe
        src={props.url}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        className={props.pdfClassName ?? ''}
      />
    );
  } else if (props.url) {
    return (
      <div className={clsx('p-1', 'relative')}>
        <div className={clsx(props.imageClassName)}>
          <TransformWrapper>
            {() => (
              <>
                <TransformComponent>
                  <Image
                    src={props.url ?? ''}
                    alt={props.alt ?? ''}
                    className={clsx(`transition-all`)}
                    style={{
                      transform: `rotate(${rotate}deg)`,
                    }}
                    preview={
                      preview ? { visible: true, onVisibleChange: () => setPreview(false) } : false
                    }
                  />
                </TransformComponent>
                <Button
                  onClick={() => setRotate((s) => s + 90)}
                  icon={<ReloadOutlined />}
                  className="cursor-pointe absolute! top-2 right-2"
                />
                <Button
                  onClick={() => setPreview(true)}
                  icon={<FileImageOutlined />}
                  className="cursor-pointe absolute! top-9 right-2"
                />
              </>
            )}
          </TransformWrapper>
        </div>
      </div>
    );
  } else if (props.active && !props.url) {
    return <Skeleton.Node className={props.skeletonClassName ?? ''} />;
  }
  return <></>;
};

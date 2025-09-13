import { Image, Skeleton } from 'antd';

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
      <Image src={props.url ?? ''} alt={props.alt ?? ''} className={props.imageClassName ?? ''} />
    );
  } else if (props.active && !props.url) {
    return <Skeleton.Node className={props.skeletonClassName ?? ''} />;
  }
  return <></>;
};

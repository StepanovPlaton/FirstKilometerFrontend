import type { TitleProps } from 'antd/lib/typography/Title';
import AntdTitle from 'antd/lib/typography/Title';

export const Title = ({ style, ...props }: TitleProps) => {
  return (
    <AntdTitle style={{ color: 'var(--color-ac1)', fontFamily: 'font', ...style }} {...props} />
  );
};

import type { TextProps } from 'antd/es/typography/Text';
import AntdText from 'antd/lib/typography/Text';

export const Text = ({ style, ...props }: TextProps) => {
  return (
    <AntdText
      style={{
        color: 'var(--color-fg0)',
        fontFamily: 'font',
        ...style,
      }}
      {...props}
    />
  );
};

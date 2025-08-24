import type { ConfigProviderProps } from 'antd/es/config-provider';
import ruLocale from 'antd/locale/ru_RU';

import '@ant-design/v5-patch-for-react-19';

const config: ConfigProviderProps = {
  locale: ruLocale,
  theme: {
    token: {
      colorPrimary: '#006fb9',
      colorText: 'var(--fg0)',
      fontFamily: `font`,
    },
    components: {
      Card: {
        colorTextHeading: 'var(--color-ac1)',
      },
      Table: {
        headerColor: 'var(--color-ac1)',
      },
    },
  },
};

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
dayjs.locale('ru');

export default config;

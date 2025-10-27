'use client';

import { TokenService, useAuthTokens, type TokenObtainData } from '@/shared/utils/schemes/tokens';
import { Button, Card, Flex, Form, Input, message, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const requiredRule = [{ required: true, message: 'Это обязательное поле' }];

export default function InitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<TokenObtainData>();
  const [messageApi, contextHolder] = message.useMessage();
  const updateAuthTokens = useAuthTokens((s) => s.updateTokens);
  // const updatePermissions = useAuthTokens((s) => s.updatePermissions);

  const submit = (obtainData: TokenObtainData) => {
    setLoading(true);
    void TokenService.obtain(obtainData)
      .then((pairOfTokens) => {
        messageApi.success('Добро пожаловать!');
        try {
          const pairOfTokensData = TokenService.tools.decodeAndValidatePairJWTToken(pairOfTokens);
          updateAuthTokens(pairOfTokensData);
          // const permissions = await TokenService.getPermissions(pairOfTokensData.access.role)
          // updatePermissions(permissions)
          router.push('/');
        } catch (e) {
          messageApi.error('Не удалось войти. Попробуйте позже');
          // eslint-disable-next-line no-console
          console.error(e);
        }
      })
      .catch(() => {
        messageApi.error('Неправильный логин или пароль');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Flex vertical gap={24} align="center">
      <img src="/logo/logo.webp" className="w-full" />
      <Card className="w-80 px-4!">
        <Spin spinning={loading}>
          <Form<TokenObtainData> layout="vertical" form={form} onFinish={submit}>
            <Form.Item<TokenObtainData> label="Логин" name={'username'} rules={requiredRule}>
              <Input />
            </Form.Item>
            <Form.Item<TokenObtainData> label="Пароль" name={'password'} rules={requiredRule}>
              <Input />
            </Form.Item>
            <Flex className="w-full" justify="space-around">
              <Button type="primary" htmlType="submit" onClick={() => form.submit()}>
                Войти
              </Button>
            </Flex>
          </Form>
        </Spin>
      </Card>
      {contextHolder}
    </Flex>
  );
}

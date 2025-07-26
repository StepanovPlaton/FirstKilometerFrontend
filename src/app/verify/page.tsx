'use client';

import type { User } from '@/entities/user';
import { Title } from '@/shared/ui/title';
import { Button, Card, Form, Input, Space } from 'antd';
import FormItem from 'antd/lib/form/FormItem';

export default function UploadPage() {
  const submit = async () => {};

  return (
    <Space direction="vertical" align="center" size="large">
      <Space size="large">
        <Card className="w-100">
          <Space direction="vertical" align="center" className="w-full">
            <Title level={2}>Клиент</Title>
            <Form<User>>
              <FormItem<User> label="Фамилия" name={['name', 'first']}>
                <Input />
              </FormItem>
            </Form>
          </Space>
        </Card>
        <Card className="w-100">
          <Space direction="vertical" align="center" className="w-full">
            <Title level={2}>Автомобиль</Title>
          </Space>
        </Card>
      </Space>
      <Button type="primary" size="large" onClick={() => void submit()}>
        Сгенерировать документы
      </Button>
    </Space>
  );
}

'use client';

import CompanyService from '@/entities/company';
import DocumentService from '@/entities/documents';
import { Title } from '@/shared/ui/title';
import type { HTTPError } from '@/shared/utils/http';
import type { Choice } from '@/shared/utils/schemes';
import { Button, Card, Col, Flex, Form, InputNumber, Row, Select, Space } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const requiredRule = [{ required: true, message: 'Это обязательное поле' }];

type CreateDocumentForm = {
  type: string;
  company: string;
  price: number;
  tax: number;
};

export default function InitPage() {
  const router = useRouter();
  const [form] = Form.useForm<CreateDocumentForm>();

  const {
    data: documentTypes,
    error: getDocumentTypesError,
    isLoading: loadingDocumentTypes,
  } = useSWR<Choice[], HTTPError>(`documents/choices`, () => DocumentService.getTypes());

  const {
    data: companies,
    error: getCompaniesError,
    isLoading: loadingCompanies,
  } = useSWR<Choice[], HTTPError>(`companies/choices`, () => CompanyService.getChoices());

  const submit = (data: CreateDocumentForm) => {
    let url = `/upload?type=${data.type}&company=${data.company}`;
    if (data.price) {
      url += `&price=${data.price}`;
    }
    if (data.tax) {
      url += `&tax=${data.tax}`;
    }
    router.push(url);
  };

  return (
    <Flex vertical align="center" justify="space-evenly" className="h-full w-full">
      <Image
        src="/logo/logo.webp"
        width={386}
        height={20}
        alt="Первый километр / автосалон"
        className="w-100"
      />
      <div className="flex w-full items-center justify-center">
        <Space direction="vertical" align="center" size="large">
          <Card className="w-110">
            <Form<CreateDocumentForm> layout="vertical" form={form} onFinish={submit}>
              <Flex vertical align="center" gap={12}>
                <Flex justify="center">
                  <Title level={2}>Создание договора</Title>
                </Flex>
                <Form.Item<CreateDocumentForm>
                  label="Тип договора"
                  name={'type'}
                  rules={requiredRule}
                >
                  <Select
                    className="w-80!"
                    placeholder="Выберите тип договора"
                    disabled={!!getDocumentTypesError}
                    loading={loadingDocumentTypes}
                    options={documentTypes ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item<CreateDocumentForm>
                  label="Компания"
                  name={'company'}
                  rules={requiredRule}
                >
                  <Select
                    className="w-80!"
                    placeholder="Выберите компанию"
                    disabled={!!getCompaniesError}
                    loading={loadingCompanies}
                    options={companies ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Row className="w-80!">
                  <Col span={12}>
                    <Form.Item<CreateDocumentForm> label="Цена" name={'price'}>
                      <InputNumber
                        className="w-38!"
                        addonAfter="₽"
                        min={0}
                        placeholder="Введите цену"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item<CreateDocumentForm> label="Комиссия" name={'tax'}>
                      <InputNumber
                        className="w-40!"
                        addonAfter="%"
                        min={0}
                        max={100}
                        placeholder="Введите комиссию"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Flex>
            </Form>
          </Card>
          <Space>
            <Button type="primary" size="large" onClick={() => form.submit()}>
              Выбрать клиента
            </Button>
          </Space>
        </Space>
      </div>
    </Flex>
  );
}

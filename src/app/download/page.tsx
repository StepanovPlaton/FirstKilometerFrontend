'use client';

import CompanyService from '@/entities/company';
import DocumentService from '@/entities/documents';
import IndividualService from '@/entities/individual';
import UserService from '@/entities/user';
import VehicleService from '@/entities/vehicle';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import type { HTTPError } from '@/shared/utils/http';
import type { Choice } from '@/shared/utils/schemes';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Spin,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const requiredRule = [{ required: true, message: 'Это обязательное поле' }];

type GetDocumentForm = {
  user: string;
  vehicle: string;
  type: string;
  company?: string;
  individual?: string;
  price: number;
  tax: number;
  date: Dayjs;
};

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seller, setSeller] = useState<'individual' | 'company'>();

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

  const {
    data: existsVehicles,
    loading: loadingExistsVehicles,
    error: failedGetExistsVehicles,
  } = useChoices(VehicleService);

  const {
    data: existsUsers,
    loading: loadingExistsUsers,
    error: failedGetExistsUsers,
  } = useChoices(UserService);

  const {
    data: individuals,
    error: getIndividualsError,
    loading: loadingIndividuals,
  } = useChoices(IndividualService);

  const searchParams = useSearchParams();

  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm<GetDocumentForm>();

  useEffect(() => {
    if (!seller) {
      if (searchParams.get('individual')) {
        setSeller('individual');
      } else {
        setSeller('company');
      }
    }
    [
      { key: 'user', list: existsUsers },
      { key: 'vehicle', list: existsVehicles },
      { key: 'type', list: documentTypes },
      { key: 'company', list: companies },
      { key: 'individual', list: individuals },
      { key: 'price', list: null },
      { key: 'tax', list: null },
      {
        key: 'date',
        list: null,
        format: (v: string) => dayjs(v),
        defaultValue: dayjs().format('YYYY-MM-DD'),
      },
    ].forEach(({ key, list, format, defaultValue }) => {
      const value = searchParams.get(key) ?? defaultValue;
      if (value && (list === null || (!!list && list.find((v) => v.value === value)))) {
        form.setFieldValue(key as keyof GetDocumentForm, format ? format(value) : value);
      }
    });
  }, [existsVehicles, existsUsers, companies, individuals, documentTypes, searchParams, form]);

  const getDocument = (data: GetDocumentForm) => {
    setLoading(true);
    void DocumentService.getDocument({ ...data, date: data.date.format('YYYY-MM-DD') })
      .then((doc) => {
        const link = document.createElement('a');
        link.download = doc.document_name;
        link.href = doc.document_url;
        link.click();
      })
      .catch(() => messageApi.error('Не удалось сформировать договор. Попробуйте позже'))
      .finally(() => setLoading(false));
  };

  return (
    <Space direction="vertical" align="center" size="large">
      <Card className="w-120">
        <Form<GetDocumentForm> layout="vertical" form={form} onFinish={getDocument}>
          <Flex vertical align="center" gap={12}>
            <Flex justify="center">
              <Title level={2}>Скачать готовый договор</Title>
            </Flex>
            <Spin spinning={loading}>
              <Form.Item<GetDocumentForm> label="Тип договора" name={'type'} rules={requiredRule}>
                <Select
                  className="w-100!"
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

              <Form.Item<GetDocumentForm> label="Клиент" name={'user'} rules={requiredRule}>
                <Select
                  className="w-100!"
                  placeholder="Выберите клиента"
                  disabled={!!failedGetExistsUsers}
                  loading={loadingExistsUsers}
                  options={existsUsers ?? []}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item<GetDocumentForm>
                label="Транспортное средство"
                name={'vehicle'}
                rules={requiredRule}
              >
                <Select
                  className="w-100!"
                  placeholder="Выберите транспортное средство"
                  disabled={!!failedGetExistsVehicles}
                  loading={loadingExistsVehicles}
                  options={existsVehicles ?? []}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Form.Item<GetDocumentForm> label="Продавец" rules={requiredRule}>
                <Select
                  className="w-100!"
                  placeholder="Выберите продавца"
                  options={[
                    {
                      label: 'Физическое лицо',
                      value: 'individual',
                    },
                    {
                      label: 'Компания',
                      value: 'company',
                    },
                  ]}
                  onChange={(v: typeof seller) => setSeller(v)}
                  value={seller}
                />
              </Form.Item>

              {seller === 'company' ? (
                <Form.Item<GetDocumentForm> label="Компания" name={'company'} rules={requiredRule}>
                  <Select
                    className="w-100!"
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
              ) : (
                <Form.Item<GetDocumentForm>
                  label="Физическое лицо"
                  name={'individual'}
                  rules={requiredRule}
                >
                  <Select
                    className="w-100!"
                    placeholder="Выберите компанию"
                    disabled={!!getIndividualsError}
                    loading={loadingIndividuals}
                    options={individuals ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              )}
              <Row className="w-100!" gutter={4}>
                <Col span={8}>
                  <Form.Item<GetDocumentForm> label="Цена" name={'price'} rules={requiredRule}>
                    <InputNumber addonAfter="₽" min={0} placeholder="Введите цену" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<GetDocumentForm> label="Комиссия" name={'tax'} rules={requiredRule}>
                    <InputNumber addonAfter="%" min={0} max={100} placeholder="Введите комиссию" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<GetDocumentForm> label="Дата" name={'date'} rules={requiredRule}>
                    <DatePicker format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Spin>
          </Flex>
        </Form>
      </Card>
      <Space>
        <Button type="primary" size="large" onClick={() => form.submit()}>
          Скачать договор
        </Button>
        <Button size="large" onClick={() => router.push('/')}>
          Создать новый договор
        </Button>
      </Space>
      {contextHolder}
    </Space>
  );
}

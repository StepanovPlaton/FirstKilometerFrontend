'use client';

import CompanyService from '@/entities/company';
import DocumentService from '@/entities/documents';
import IndividualService from '@/entities/individual';
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
} from 'antd';
import type { Dayjs } from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const requiredRule = [{ required: true, message: 'Это обязательное поле' }];

type CreateDocumentForm = {
  type: string;
  company?: string;
  individual?: string;
  price: number;
  tax: number;
  date: Dayjs;
};

export default function InitPage() {
  const router = useRouter();
  const [form] = Form.useForm<CreateDocumentForm>();
  const [messageApi, contextHolder] = message.useMessage();
  const [seller, setSeller] = useState<'individual' | 'company'>('company');

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
    data: individuals,
    error: getIndividualsError,
    loading: loadingIndividuals,
  } = useChoices(IndividualService);

  const submit = (data: CreateDocumentForm) => {
    let url = `/upload?type=${data.type}`;
    (['price', 'tax'] as (keyof CreateDocumentForm)[]).map((key) => {
      if (key in data) {
        url += `&${key}=${data[key] as string}`;
      }
    });
    if ('date' in data) {
      url += `&date=${data['date'].format('YYYY-MM-DD')}`;
    }
    if (seller === 'company') {
      url += `&company=${data.company}`;
    } else if (seller === 'individual') {
      url += `&individual=${data.individual}`;
    }
    router.push(url);
  };

  useEffect(() => {
    if (getCompaniesError) {
      messageApi.error('Не получилось получить список компаний. Попробуйте позже');
    }
    if (getDocumentTypesError) {
      messageApi.error('Не получилось получить список компаний. Попробуйте позже');
    }
    if (getIndividualsError) {
      messageApi.error('Не получилось получить список физических лиц. Попробуйте позже');
    }
  }, [getCompaniesError, getDocumentTypesError]);

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
          <Card className="w-120">
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

                <Form.Item<CreateDocumentForm> label="Продавец" rules={requiredRule}>
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
                    defaultValue={seller}
                  />
                </Form.Item>

                {seller === 'company' ? (
                  <Form.Item<CreateDocumentForm>
                    label="Компания"
                    name={'company'}
                    rules={requiredRule}
                  >
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
                  <Form.Item<CreateDocumentForm>
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
                    <Form.Item<CreateDocumentForm> label="Цена" name={'price'}>
                      <InputNumber
                        className="w-full!"
                        addonAfter="₽"
                        min={0}
                        placeholder="Введите цену"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item<CreateDocumentForm> label="Комиссия" name={'tax'}>
                      <InputNumber
                        addonAfter="%"
                        min={0}
                        max={100}
                        placeholder="Введите комиссию"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item<CreateDocumentForm> label="Дата" name={'date'}>
                      <DatePicker placeholder="Выберите дату" format="DD.MM.YYYY" />
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
      {contextHolder}
    </Flex>
  );
}

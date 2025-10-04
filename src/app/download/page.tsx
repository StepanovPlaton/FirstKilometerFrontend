'use client';

import DocumentService from '@/entities/documents';
import ExternalCompanyService from '@/entities/external-company';
import IndividualService from '@/entities/individual';
import InternalCompanyService from '@/entities/internal-company';
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
  buyer: string;
  buyer_id: string | number;
  seller: string;
  seller_id: string | number;
  vehicle: string;
  type: string;
  price?: number;
  tax?: number;
  date?: Dayjs;
  options?: string;
};

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [buyer, setBuyer] = useState<'user' | 'internal_company' | 'external_company'>();
  const [seller, setSeller] = useState<'individual' | 'internal_company' | 'external_company'>();

  const {
    data: documentTypes,
    error: getDocumentTypesError,
    isLoading: loadingDocumentTypes,
  } = useSWR<Choice[], HTTPError>(`documents/choices`, () => DocumentService.getTypes());

  const {
    data: internalCompanies,
    error: getInternalCompaniesError,
    loading: loadingInternalCompanies,
  } = useChoices(InternalCompanyService);

  const {
    data: externalCompanies,
    error: getExternalCompaniesError,
    loading: loadingExternalCompanies,
  } = useChoices(ExternalCompanyService);

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
  const isTaxDoc = Form.useWatch((v) => v.type === 'sale', form);
  const isReturnDoc = Form.useWatch((v) => v.type === 'return', form);
  const documentType = Form.useWatch('type', form);

  useEffect(() => {
    if (!seller) {
      setSeller(searchParams.get('seller') as never as typeof seller);
    }
    if (!buyer) {
      setBuyer(searchParams.get('buyer') as never as typeof buyer);
    }
    [
      { key: 'buyer', list: null },
      { key: 'buyer_id', list: [existsUsers, externalCompanies, internalCompanies] },
      { key: 'vehicle', list: [existsVehicles] },
      { key: 'type', list: [documentTypes] },
      { key: 'seller', list: null },
      { key: 'seller_id', list: [individuals, externalCompanies, internalCompanies] },
      { key: 'price', list: null },
      { key: 'tax', list: null },
      { key: 'options', list: null, format: (v: string) => v.split(',') },
      {
        key: 'date',
        list: null,
        format: (v: string) => dayjs(v),
        defaultValue: dayjs().format('YYYY-MM-DD'),
      },
    ].forEach(({ key, list, format, defaultValue }) => {
      const value = searchParams.get(key) ?? defaultValue;
      if (
        value &&
        (list === null || (!!list && list.some((l) => l?.find((v) => v.value === value))))
      ) {
        form.setFieldValue(key as keyof GetDocumentForm, format ? format(value) : value);
      }
    });
  }, [
    existsVehicles,
    existsUsers,
    internalCompanies,
    externalCompanies,
    individuals,
    documentTypes,
    searchParams,
    form,
  ]);

  const getDocument = (data: GetDocumentForm) => {
    setLoading(true);
    void DocumentService.getDocument({
      ...data,
      date: data.date?.format('YYYY-MM-DD'),
      buyer,
      seller,
    })
      .then((doc) => {
        const link = document.createElement('a');
        link.download = doc.document_name;
        link.href = doc.document_url;
        link.click();
      })
      .catch(() => messageApi.error('Не удалось сформировать договор. Попробуйте позже'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (getInternalCompaniesError) {
      messageApi.error('Не получилось получить список юридических лиц. Попробуйте позже');
    }
    if (getDocumentTypesError) {
      messageApi.error('Не получилось получить список типов документов. Попробуйте позже');
    }
    if (getIndividualsError) {
      messageApi.error('Не получилось получить список физических лиц. Попробуйте позже');
    }
  }, [getInternalCompaniesError, getDocumentTypesError, getIndividualsError, messageApi]);

  useEffect(() => {
    if (isTaxDoc) {
      setSeller('internal_company');
    }
  }, [isTaxDoc]);

  useEffect(() => {
    if (form.getFieldValue('seller_id')) {
      form.resetFields(['seller_id']);
    }
  }, [seller]);
  useEffect(() => {
    if (form.getFieldValue('buyer_id')) {
      form.resetFields(['buyer_id']);
    }
    if (seller === 'internal_company' && documentType !== 'sale') {
      setSeller('external_company');
    }
  }, [buyer]);

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

              <Form.Item<GetDocumentForm> label="Покупатель" rules={requiredRule}>
                <Select
                  className="w-100!"
                  placeholder="Выберите покупателя"
                  options={[
                    {
                      label: 'Клиент',
                      value: 'user',
                    },
                    {
                      label: 'Филиал',
                      value: 'internal_company',
                      disabled: isTaxDoc,
                    },
                    {
                      label: 'Юридическое лицо',
                      value: 'external_company',
                    },
                  ]}
                  onChange={(v: typeof buyer) => setBuyer(v)}
                  value={buyer}
                />
              </Form.Item>
              {buyer === 'internal_company' ? (
                <Form.Item<GetDocumentForm> label="Филиал" name={'buyer_id'} rules={requiredRule}>
                  <Select
                    className="w-100!"
                    placeholder="Выберите филиал"
                    disabled={!!getInternalCompaniesError}
                    loading={loadingInternalCompanies}
                    options={internalCompanies ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              ) : buyer === 'external_company' ? (
                <Form.Item<GetDocumentForm>
                  label="Юридическое лицо"
                  name={'buyer_id'}
                  rules={requiredRule}
                >
                  <Select
                    className="w-100!"
                    placeholder="Выберите юридическое лицо"
                    disabled={!!getExternalCompaniesError}
                    loading={loadingExternalCompanies}
                    options={externalCompanies ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              ) : (
                <Form.Item<GetDocumentForm> label="Клиент" name={'buyer_id'} rules={requiredRule}>
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
              )}

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
              {!isTaxDoc && (
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
                        label: 'Филиал',
                        value: 'internal_company',
                        disabled: buyer === 'internal_company',
                      },
                      {
                        label: 'Юридическое лицо',
                        value: 'external_company',
                      },
                    ]}
                    onChange={(v: typeof seller) => setSeller(v)}
                    value={seller}
                  />
                </Form.Item>
              )}

              {seller === 'internal_company' ? (
                <Form.Item<GetDocumentForm> label="Филиал" name={'seller_id'} rules={requiredRule}>
                  <Select
                    className="w-100!"
                    placeholder="Выберите филиал"
                    disabled={!!getInternalCompaniesError}
                    loading={loadingInternalCompanies}
                    options={internalCompanies ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              ) : seller === 'external_company' ? (
                <Form.Item<GetDocumentForm>
                  label="Юридическое лицо"
                  name={'seller_id'}
                  rules={requiredRule}
                >
                  <Select
                    className="w-100!"
                    placeholder="Выберите юридическое лицо"
                    disabled={!!getExternalCompaniesError}
                    loading={loadingExternalCompanies}
                    options={externalCompanies ?? []}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              ) : (
                <Form.Item<GetDocumentForm>
                  label="Физическое лицо"
                  name={'seller_id'}
                  rules={requiredRule}
                >
                  <Select
                    className="w-100!"
                    placeholder="Выберите юридическое лицо"
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
                {!isReturnDoc && (
                  <Col span={12}>
                    <Form.Item<GetDocumentForm> label="Цена" name={'price'}>
                      <InputNumber
                        className="w-full!"
                        addonAfter="₽"
                        min={0}
                        placeholder="Введите цену"
                      />
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item<GetDocumentForm> label="Дата" name={'date'}>
                    <DatePicker
                      placeholder="Выберите дату"
                      format="DD.MM.YYYY"
                      className="w-full!"
                    />
                  </Form.Item>
                </Col>
              </Row>
              {isTaxDoc && (
                <Row className="w-100!" gutter={4}>
                  <Col span={8}>
                    <Form.Item<GetDocumentForm>
                      label="Комиссия"
                      name={'tax'}
                      rules={isTaxDoc ? requiredRule : []}
                    >
                      <InputNumber
                        className="w-full!"
                        addonAfter="₽"
                        min={0}
                        placeholder="Введите комиссию"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item<GetDocumentForm>
                      label="Опции"
                      name={'options'}
                      rules={isTaxDoc ? requiredRule : []}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        className="w-full!"
                        placeholder="Выберите опции"
                        options={[
                          'СТС',
                          'ПТС',
                          'ЭПТС',
                          'Один комплект ключей',
                          'Два комплекта ключей',
                          'Летняя резина',
                          'Зимняя резина',
                          'Сервисная книжка',
                        ].map((i) => ({ value: i, label: i }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
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

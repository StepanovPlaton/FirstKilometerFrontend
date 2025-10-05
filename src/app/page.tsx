'use client';

import DocumentService from '@/entities/documents';
import ExternalCompanyService from '@/entities/external-company';
import IndividualService from '@/entities/individual';
import InternalCompanyService from '@/entities/internal-company';
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
  internal_company?: string;
  external_company?: string;
  individual?: string;
  price?: number;
  tax?: number;
  date?: Dayjs;
  options?: string;
  additional_services?: string;
  additional_services_cost?: number;
};

export default function InitPage() {
  const router = useRouter();
  const [form] = Form.useForm<CreateDocumentForm>();
  const [messageApi, contextHolder] = message.useMessage();
  const [seller, setSeller] = useState<'individual' | 'internal_company' | 'external_company'>(
    'internal_company'
  );
  const isTaxDoc = Form.useWatch((v) => v.type === 'sale', form);
  const isReturnDoc = Form.useWatch((v) => v.type === 'return', form);
  const hasAdditionalServices = Form.useWatch((v) => !!v.additional_services, form);

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
    data: individuals,
    error: getIndividualsError,
    loading: loadingIndividuals,
  } = useChoices(IndividualService);

  const submit = (data: CreateDocumentForm) => {
    let url =
      `/upload?type=${data.type}&seller=${seller}` +
      `&seller_id=${seller === 'internal_company' ? data.internal_company : seller === 'external_company' ? data.external_company : data.individual}`;
    if ('price' in data && data.price) {
      url += `&price=${data.price}`;
    }
    if ('date' in data && data.date) {
      url += `&date=${data.date.format('YYYY-MM-DD')}`;
    }
    if (isTaxDoc) {
      url += `&tax=${data.tax}&options=${data.options}`;
      if ('additional_services' in data && data.additional_services) {
        url += `&additional_services=${data.additional_services}&additional_services_cost=${data.additional_services_cost}`;
      }
    }
    router.push(url);
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

  return (
    <Flex vertical align="center" justify="space-evenly" className="h-full w-full" gap={24}>
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

                {!isTaxDoc && (
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
                          label: 'Филиал',
                          value: 'internal_company',
                        },
                        {
                          label: 'Юридическое лицо',
                          value: 'external_company',
                        },
                      ]}
                      onChange={(v: typeof seller) => setSeller(v)}
                      defaultValue={seller}
                    />
                  </Form.Item>
                )}

                {seller === 'internal_company' ? (
                  <Form.Item<CreateDocumentForm>
                    label="Филиал"
                    name={'internal_company'}
                    rules={requiredRule}
                  >
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
                  <Form.Item<CreateDocumentForm>
                    label="Юридическое лицо"
                    name={'external_company'}
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
                  <Form.Item<CreateDocumentForm>
                    label="Физическое лицо"
                    name={'individual'}
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
                      <Form.Item<CreateDocumentForm> label="Цена" name={'price'}>
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
                    <Form.Item<CreateDocumentForm> label="Дата" name={'date'}>
                      <DatePicker
                        placeholder="Выберите дату"
                        format="DD.MM.YYYY"
                        className="w-full!"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {isTaxDoc && (
                  <>
                    <Row className="w-100!" gutter={4}>
                      <Col span={8}>
                        <Form.Item<CreateDocumentForm>
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
                        <Form.Item<CreateDocumentForm>
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
                    <Row className="w-100!" gutter={4}>
                      <Col span={16}>
                        <Form.Item<CreateDocumentForm>
                          label="Дополнительные услуги"
                          name={'additional_services'}
                        >
                          <Select
                            mode="tags"
                            allowClear
                            className="w-full!"
                            placeholder="Выберите дополнительные услуги"
                            options={[].map((i) => ({ value: i, label: i }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item<CreateDocumentForm>
                          label="Стоимость"
                          name={'additional_services_cost'}
                          rules={hasAdditionalServices ? requiredRule : []}
                        >
                          <InputNumber
                            className="w-full!"
                            addonAfter="₽"
                            min={0}
                            placeholder="Введите стоимость"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}
              </Flex>
            </Form>
          </Card>
          <Space>
            <Button type="primary" size="large" onClick={() => form.submit()}>
              Выбрать покупателя
            </Button>
          </Space>
        </Space>
      </div>
      {contextHolder}
    </Flex>
  );
}

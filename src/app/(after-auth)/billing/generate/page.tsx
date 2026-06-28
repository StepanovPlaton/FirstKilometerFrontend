'use client';

import ExternalCompanyService from '@/entities/external-company';
import IndividualService from '@/entities/individual';
import InternalCompanyService from '@/entities/internal-company';
import ProcedureService from '@/entities/procedure';
import VehicleService from '@/entities/vehicle';
import { postGenerateBilling } from '@/features/billing/generateInvoice';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import { useCompanyPaymentAccounts } from '@/shared/utils/hooks/company-payment-accounts';
import { useEntities } from '@/shared/utils/hooks/data';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Divider,
  Flex,
  Form,
  InputNumber,
  Radio,
  Segmented,
  Select,
  Space,
  Spin,
  message,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

dayjs.locale('ru');

function triggerFileDownload(fileName: string, fileUrl: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = fileUrl;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  link.click();
}

type GenerateMode = 'vehicle' | 'procedures';

type FormValues = {
  company_id: number;
  payment_account_id?: number;
  due_date: Dayjs;
  vat_percentage: number;
  vehicle_uuid?: string;
  total_amount?: number;
  buyer_type: 'person' | 'company';
  buyer_person_uuid?: string;
  buyer_company_id?: number;
};

type ProcedureItem = {
  key: number;
  kind: 'product' | 'service';
  procedure_id: number | undefined;
  price: number;
  quantity: number;
};

export default function GenerateBillingPage() {
  const router = useRouter();
  const permissions = useAuthTokens((s) => s.permissions);
  const [mode, setMode] = useState<GenerateMode>('vehicle');
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<FormValues>();

  const [procedureItems, setProcedureItems] = useState<ProcedureItem[]>([]);
  const [nextKey, setNextKey] = useState(1);

  const addProductItem = () => {
    setProcedureItems((prev) => [
      ...prev,
      { key: nextKey, kind: 'product', procedure_id: undefined, price: 0, quantity: 1 },
    ]);
    setNextKey((k) => k + 1);
  };

  const addServiceItem = () => {
    setProcedureItems((prev) => [
      ...prev,
      { key: nextKey, kind: 'service', procedure_id: undefined, price: 0, quantity: 1 },
    ]);
    setNextKey((k) => k + 1);
  };

  const removeProcedureItem = (key: number) => {
    setProcedureItems((prev) => prev.filter((item) => item.key !== key));
  };

  const updateProcedureItem = (key: number, patch: Partial<ProcedureItem>) => {
    setProcedureItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const procedureTotal = useMemo(
    () => procedureItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [procedureItems]
  );

  const { data: internalCompanies, loading: loadingInternal } = useEntities(InternalCompanyService);
  const { data: externalCompanies, loading: loadingExternal } = useEntities(ExternalCompanyService);
  const { data: vehicleChoices, loading: loadingVehicles } = useChoices(VehicleService, undefined, {
    active: mode === 'vehicle',
  });
  const { data: personChoices, loading: loadingPersonChoices } = useChoices(IndividualService);
  const { data: productChoices, loading: loadingProductChoices } = useChoices(ProcedureService, {
    query: { kind: 'product' },
  });
  const { data: serviceChoices, loading: loadingServiceChoices } = useChoices(ProcedureService, {
    query: { kind: 'service' },
  });

  const companyId = Form.useWatch('company_id', form);
  const { data: paymentAccounts, loading: loadingPaymentAccounts } =
    useCompanyPaymentAccounts(companyId);

  useEffect(() => {
    if (!loadingPaymentAccounts && paymentAccounts?.length === 1) {
      const singleAccount = paymentAccounts[0];
      if (singleAccount) {
        form.setFieldValue('payment_account_id', singleAccount.id);
      }
    }
  }, [paymentAccounts, loadingPaymentAccounts, form]);

  const paymentAccountOptions = useMemo(
    () =>
      paymentAccounts?.map((a) => ({
        value: a.id,
        label: a.bank_account,
      })) ?? [],
    [paymentAccounts]
  );

  const showNoPaymentAccountsAlert =
    companyId !== null && !loadingPaymentAccounts && paymentAccounts?.length === 0;

  const canView = permissions.includes('view_billing') || permissions.includes('add_billing');
  const canSubmit = permissions.includes('add_billing');

  const companyBuyerOptions = useMemo(() => {
    const internal =
      internalCompanies?.map((c) => ({
        value: c.id,
        label: `[Филиал] ${c.short_name || c.name}`,
      })) ?? [];
    const external =
      externalCompanies?.map((c) => ({
        value: c.id,
        label: `[Юр. лицо] ${c.short_name || c.name}`,
      })) ?? [];
    return [...internal, ...external].sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [internalCompanies, externalCompanies]);

  const productOptions = useMemo(
    () =>
      productChoices?.map((c) => ({
        value: c.value,
        label: c.label,
      })) ?? [],
    [productChoices]
  );

  const serviceOptions = useMemo(
    () =>
      serviceChoices?.map((c) => ({
        value: c.value,
        label: c.label,
      })) ?? [],
    [serviceChoices]
  );

  const personOptions = useMemo(
    () =>
      personChoices?.map((c) => ({
        value: String(c.value),
        label: c.label,
      })) ?? [],
    [personChoices]
  );

  const onFinish = (values: FormValues) => {
    if (!canSubmit) {
      return;
    }
    if (!values.payment_account_id) {
      messageApi.error('Выберите расчётный счёт');
      return;
    }
    if (paymentAccounts?.length === 0) {
      messageApi.error('У выбранного филиала нет привязанных расчётных счетов');
      return;
    }
    const due_date = values.due_date.format('YYYY-MM-DD');
    const vat = values.vat_percentage ?? 0;

    let body: Record<string, unknown>;

    if (mode === 'vehicle') {
      if (!values.vehicle_uuid) {
        messageApi.error('Выберите транспортное средство');
        return;
      }
      if (values.total_amount === undefined || values.total_amount === null) {
        messageApi.error('Укажите сумму');
        return;
      }
      body = {
        vehicle_uuid: values.vehicle_uuid,
        company_id: values.company_id,
        payment_account_id: values.payment_account_id,
        total_amount: values.total_amount,
        vat_percentage: vat,
        due_date,
      };
    } else {
      const items = procedureItems.filter((item) => item.procedure_id !== undefined);
      if (items.length === 0) {
        messageApi.error('Добавьте хотя бы одну услугу');
        return;
      }
      if (values.buyer_type === 'person') {
        if (!values.buyer_person_uuid) {
          messageApi.error('Выберите покупателя (физ. лицо)');
          return;
        }
        body = {
          procedure_items: items.map((i) => ({
            procedure_id: i.procedure_id,
            price: i.price,
            quantity: i.quantity,
          })),
          company_id: values.company_id,
          payment_account_id: values.payment_account_id,
          buyer_type: 'person',
          buyer_id: values.buyer_person_uuid,
          vat_percentage: vat,
          due_date,
        };
      } else {
        if (values.buyer_company_id === undefined || values.buyer_company_id === null) {
          messageApi.error('Выберите покупателя (компания)');
          return;
        }
        body = {
          procedure_items: items.map((i) => ({
            procedure_id: i.procedure_id,
            price: i.price,
            quantity: i.quantity,
          })),
          company_id: values.company_id,
          payment_account_id: values.payment_account_id,
          buyer_type: 'company',
          buyer_id: values.buyer_company_id,
          vat_percentage: vat,
          due_date,
        };
      }
    }

    setSubmitting(true);
    void postGenerateBilling(body)
      .then((res) => {
        if (res.document_url && res.document_name) {
          triggerFileDownload(res.document_name, res.document_url);
          messageApi.success('Счёт сформирован');
        } else if (res.archive_url && res.archive_name) {
          triggerFileDownload(res.archive_name, res.archive_url);
          messageApi.success('Счёт сформирован');
        } else {
          messageApi.warning('В ответе нет ссылки на файл');
        }
      })
      .catch(() => {
        messageApi.error('Не удалось сформировать счёт. Проверьте данные и попробуйте снова');
      })
      .finally(() => setSubmitting(false));
  };

  if (!canView) {
    return (
      <Space direction="vertical" align="center" size="large" className="w-full">
        <p>Нет доступа к разделу «Сгенерировать счёт».</p>
      </Space>
    );
  }

  return (
    <Space direction="vertical" align="center" size="large">
      <Card className="w-120 max-w-full">
        <Flex vertical align="center" gap={12} className="w-full">
          <Title level={2} className="text-center!">
            Сгенерировать счёт
          </Title>

          <Segmented
            className="w-full max-w-md"
            block
            options={[
              { label: 'По автомобилю', value: 'vehicle' },
              { label: 'По услугам', value: 'procedures' },
            ]}
            value={mode}
            onChange={(v) => {
              setMode(v as GenerateMode);
            }}
          />

          <Form<FormValues>
            form={form}
            layout="vertical"
            disabled={!canSubmit}
            initialValues={{
              vat_percentage: 0,
              buyer_type: 'person',
              due_date: dayjs(),
            }}
            onFinish={onFinish}
          >
            <Flex vertical align="center" gap={12} className="w-full">
              <Spin spinning={submitting} className="w-full">
                <Flex vertical gap={12} className="w-full">
                  <Form.Item
                    name="company_id"
                    label="Компания-получатель (филиал)"
                    rules={[{ required: true, message: 'Выберите филиал' }]}
                    className="mb-0! w-full"
                  >
                    <Select
                      className="w-100!"
                      showSearch
                      optionFilterProp="label"
                      loading={loadingInternal}
                      placeholder="Филиал"
                      options={
                        internalCompanies?.map((c) => ({
                          value: c.id,
                          label: c.short_name || c.name,
                        })) ?? []
                      }
                      onChange={() => {
                        form.setFieldValue('payment_account_id', undefined);
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    name="payment_account_id"
                    label="Расчётный счёт"
                    rules={[{ required: true, message: 'Выберите расчётный счёт' }]}
                    className="mb-0! w-full"
                  >
                    <Select
                      className="w-100!"
                      showSearch
                      optionFilterProp="label"
                      loading={loadingPaymentAccounts}
                      disabled={
                        companyId === null || loadingPaymentAccounts || showNoPaymentAccountsAlert
                      }
                      placeholder={companyId === null ? 'Сначала выберите филиал' : 'Расчётный счёт'}
                      options={paymentAccountOptions}
                    />
                  </Form.Item>

                  {showNoPaymentAccountsAlert && (
                    <Alert
                      type="warning"
                      showIcon
                      message="У выбранного филиала нет привязанных расчётных счетов."
                      description={
                        <span>
                          Добавьте счёт в{' '}
                          <Link href="/tables/companies/payment-accounts">справочнике</Link> или
                          привяжите его к филиалу в{' '}
                          <Link href="/tables/companies/internal">таблице филиалов</Link>.
                        </span>
                      }
                    />
                  )}

                  <Form.Item
                    name="due_date"
                    label="Срок оплаты"
                    rules={[{ required: true, message: 'Укажите срок оплаты' }]}
                    className="mb-0! w-full"
                  >
                    <DatePicker className="w-100!" format="DD.MM.YYYY" />
                  </Form.Item>

                  <Form.Item
                    name="vat_percentage"
                    label="НДС, %"
                    rules={[{ required: true, message: 'Укажите процент НДС' }]}
                    className="mb-0! w-full"
                  >
                    <InputNumber className="w-100!" min={0} max={100} step={1} precision={2} />
                  </Form.Item>

                  {mode === 'vehicle' ? (
                    <>
                      <Form.Item
                        name="vehicle_uuid"
                        label="Транспортное средство"
                        rules={[{ required: true, message: 'Выберите ТС' }]}
                        className="mb-0! w-full"
                      >
                        <Select
                          className="w-100!"
                          showSearch
                          optionFilterProp="label"
                          loading={loadingVehicles}
                          placeholder="ТС"
                          options={vehicleChoices ?? []}
                        />
                      </Form.Item>
                      <Form.Item
                        name="total_amount"
                        label="Сумма"
                        rules={[{ required: true, message: 'Укажите сумму' }]}
                        className="mb-0! w-full"
                      >
                        <InputNumber
                          className="w-100!"
                          min={0}
                          step={0.01}
                          precision={2}
                          addonAfter="₽"
                          formatter={(v) =>
                            `${v}`
                              .split('')
                              .reverse()
                              .map((e, i, a) => (i % 3 === 2 && i !== a.length - 1 ? ' ' + e : e))
                              .reverse()
                              .join('')
                          }
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <Flex vertical gap={16} className="w-full">
                        {/* === Товары === */}
                        <Flex vertical gap={8} className="w-full">
                          <Flex justify="space-between" align="center" className="w-full">
                            <span className="font-medium">Товары</span>
                            <Button
                              type="dashed"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={addProductItem}
                            >
                              Добавить товар
                            </Button>
                          </Flex>

                          {procedureItems
                            .filter((item) => item.kind === 'product')
                            .map((item) => {
                              const usedIds = procedureItems
                                .filter((i) => i.key !== item.key)
                                .map((i) => i.procedure_id)
                                .filter((v): v is number => v !== undefined);
                              return (
                                <Flex key={item.key} gap={8} align="center" className="w-full">
                                  <Select
                                    className="max-w-44 min-w-44 flex-1!"
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Выберите товар"
                                    loading={loadingProductChoices}
                                    value={item.procedure_id}
                                    onChange={(v) =>
                                      updateProcedureItem(item.key, { procedure_id: v })
                                    }
                                    options={productOptions.filter(
                                      (o) => !usedIds.includes(o.value as number)
                                    )}
                                  />
                                  <InputNumber
                                    className="w-28!"
                                    min={0}
                                    step={0.01}
                                    precision={2}
                                    addonAfter="₽"
                                    placeholder="Цена"
                                    value={item.price}
                                    formatter={(v) =>
                                      `${v}`
                                        .split('')
                                        .reverse()
                                        .map((e, i, a) =>
                                          i % 3 === 2 && i !== a.length - 1 ? ' ' + e : e
                                        )
                                        .reverse()
                                        .join('')
                                    }
                                    onChange={(v) =>
                                      updateProcedureItem(item.key, { price: v ?? 0 })
                                    }
                                  />
                                  <InputNumber
                                    className="w-16!"
                                    min={1}
                                    precision={0}
                                    placeholder="Кол-во"
                                    value={item.quantity}
                                    onChange={(v) =>
                                      updateProcedureItem(item.key, { quantity: v ?? 1 })
                                    }
                                  />
                                  <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeProcedureItem(item.key)}
                                  />
                                </Flex>
                              );
                            })}

                          {procedureItems.filter((item) => item.kind === 'product').length ===
                            0 && (
                            <Flex justify="center" className="w-full">
                              <span className="text-sm text-gray-400">Нет добавленных товаров</span>
                            </Flex>
                          )}
                        </Flex>

                        <Divider className="my-0!" />

                        {/* === Услуги === */}
                        <Flex vertical gap={8} className="w-full">
                          <Flex justify="space-between" align="center" className="w-full">
                            <span className="font-medium">Услуги</span>
                            <Button
                              type="dashed"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={addServiceItem}
                            >
                              Добавить услугу
                            </Button>
                          </Flex>

                          {procedureItems
                            .filter((item) => item.kind === 'service')
                            .map((item) => {
                              const usedIds = procedureItems
                                .filter((i) => i.key !== item.key)
                                .map((i) => i.procedure_id)
                                .filter((v): v is number => v !== undefined);
                              return (
                                <Flex key={item.key} gap={8} align="center" className="w-full">
                                  <Select
                                    className="max-w-44 min-w-44 flex-1!"
                                    showSearch
                                    optionFilterProp="label"
                                    placeholder="Выберите услугу"
                                    loading={loadingServiceChoices}
                                    value={item.procedure_id}
                                    onChange={(v) =>
                                      updateProcedureItem(item.key, { procedure_id: v })
                                    }
                                    options={serviceOptions.filter(
                                      (o) => !usedIds.includes(o.value as number)
                                    )}
                                  />
                                  <InputNumber
                                    className="w-28!"
                                    min={0}
                                    step={0.01}
                                    precision={2}
                                    addonAfter="₽"
                                    placeholder="Цена"
                                    value={item.price}
                                    formatter={(v) =>
                                      `${v}`
                                        .split('')
                                        .reverse()
                                        .map((e, i, a) =>
                                          i % 3 === 2 && i !== a.length - 1 ? ' ' + e : e
                                        )
                                        .reverse()
                                        .join('')
                                    }
                                    onChange={(v) =>
                                      updateProcedureItem(item.key, { price: v ?? 0 })
                                    }
                                  />
                                  <InputNumber
                                    className="w-16!"
                                    min={1}
                                    precision={0}
                                    placeholder="Кол-во"
                                    value={item.quantity}
                                    onChange={(v) =>
                                      updateProcedureItem(item.key, { quantity: v ?? 1 })
                                    }
                                  />
                                  <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeProcedureItem(item.key)}
                                  />
                                </Flex>
                              );
                            })}

                          {procedureItems.filter((item) => item.kind === 'service').length ===
                            0 && (
                            <Flex justify="center" className="w-full">
                              <span className="text-sm text-gray-400">Нет добавленных услуг</span>
                            </Flex>
                          )}
                        </Flex>
                      </Flex>

                      {procedureItems.length > 0 && (
                        <Flex justify="end" className="w-full">
                          <span>
                            <strong>Итого: </strong>
                            {procedureTotal.toLocaleString('ru-RU', {
                              style: 'currency',
                              currency: 'RUB',
                            })}
                          </span>
                        </Flex>
                      )}

                      <Form.Item name="buyer_type" label="Тип покупателя" className="mb-0! w-full">
                        <Radio.Group className="w-full">
                          <Flex gap="small" wrap="wrap">
                            <Radio value="person">Физ. лицо</Radio>
                            <Radio value="company">Компания</Radio>
                          </Flex>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, cur) =>
                          (prev as { buyer_type?: string }).buyer_type !==
                          (cur as { buyer_type?: string }).buyer_type
                        }
                        className="w-full"
                      >
                        {({ getFieldValue }) =>
                          getFieldValue('buyer_type') === 'person' ? (
                            <Form.Item
                              name="buyer_person_uuid"
                              label="Покупатель"
                              rules={[{ required: true, message: 'Выберите физ. лицо' }]}
                              className="mb-0! w-full"
                            >
                              <Select
                                className="w-100!"
                                showSearch
                                optionFilterProp="label"
                                loading={loadingPersonChoices}
                                placeholder="Физ. лицо"
                                options={personOptions}
                              />
                            </Form.Item>
                          ) : (
                            <Form.Item
                              name="buyer_company_id"
                              label="Покупатель"
                              rules={[{ required: true, message: 'Выберите компанию' }]}
                              className="mb-0! w-full"
                            >
                              <Select
                                className="w-100!"
                                showSearch
                                optionFilterProp="label"
                                loading={loadingInternal || loadingExternal}
                                placeholder="Компания"
                                options={companyBuyerOptions}
                              />
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                    </>
                  )}
                </Flex>
              </Spin>
            </Flex>
          </Form>
        </Flex>
      </Card>

      <Space wrap align="center" size="middle">
        <Button
          type="primary"
          size="large"
          loading={submitting}
          disabled={!canSubmit}
          onClick={() => form.submit()}
        >
          Сформировать счёт
        </Button>
        <Button size="large" onClick={() => router.push('/')}>
          На главную
        </Button>
      </Space>

      {contextHolder}
    </Space>
  );
}

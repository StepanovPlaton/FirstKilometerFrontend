'use client';

import ExternalCompanyService from '@/entities/external-company';
import IndividualService from '@/entities/individual';
import InternalCompanyService from '@/entities/internal-company';
import ProcedureService from '@/entities/procedure';
import VehicleService from '@/entities/vehicle';
import { postGenerateBilling } from '@/features/billing/generateInvoice';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import { useEntities } from '@/shared/utils/hooks/data';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import {
  Button,
  Card,
  DatePicker,
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
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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
  due_date: Dayjs;
  vat_percentage: number;
  vehicle_uuid?: string;
  total_amount?: number;
  procedure_ids?: number[];
  buyer_type: 'person' | 'company';
  buyer_person_uuid?: string;
  buyer_company_id?: number;
};

export default function GenerateBillingPage() {
  const router = useRouter();
  const permissions = useAuthTokens((s) => s.permissions);
  const [mode, setMode] = useState<GenerateMode>('vehicle');
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<FormValues>();

  const { data: internalCompanies, loading: loadingInternal } = useEntities(InternalCompanyService);
  const { data: externalCompanies, loading: loadingExternal } = useEntities(ExternalCompanyService);
  const { data: vehicles, loading: loadingVehicles } = useEntities(VehicleService);
  const { data: procedures, loading: loadingProcedures } = useEntities(ProcedureService);
  const { data: personChoices, loading: loadingPersonChoices } = useChoices(IndividualService);

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

  const vehicleOptions = useMemo(
    () =>
      vehicles?.map((v) => ({
        value: v.uuid,
        label: [v.reg_number, v.make_model].filter(Boolean).join(' · ') || String(v.uuid),
      })) ?? [],
    [vehicles]
  );

  const procedureOptions = useMemo(
    () =>
      procedures?.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.price} ₽)`,
      })) ?? [],
    [procedures]
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
        total_amount: values.total_amount,
        vat_percentage: vat,
        due_date,
      };
    } else {
      const ids = values.procedure_ids ?? [];
      if (ids.length === 0) {
        messageApi.error('Выберите хотя бы одну услугу');
        return;
      }
      if (values.buyer_type === 'person') {
        if (!values.buyer_person_uuid) {
          messageApi.error('Выберите покупателя (физ. лицо)');
          return;
        }
        body = {
          procedure_ids: ids,
          company_id: values.company_id,
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
          procedure_ids: ids,
          company_id: values.company_id,
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
                    />
                  </Form.Item>

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
                          options={vehicleOptions}
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
                        />
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <Form.Item
                        name="procedure_ids"
                        label="Услуги / работы"
                        rules={[{ required: true, message: 'Выберите услуги' }]}
                        className="mb-0! w-full"
                      >
                        <Select
                          className="w-100!"
                          mode="multiple"
                          allowClear
                          loading={loadingProcedures}
                          placeholder="Операции"
                          options={procedureOptions}
                        />
                      </Form.Item>
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
                        shouldUpdate={(prev, cur) => prev.buyer_type !== cur.buyer_type}
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

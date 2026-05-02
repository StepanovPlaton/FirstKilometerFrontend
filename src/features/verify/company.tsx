import { PaymentAccountService } from '@/entities/payment-account';
import { Title } from '@/shared/ui/title';
import {
  companyFormValuesSchema,
  type CompanyApi,
  type CompanyFormValues,
} from '@/shared/utils/schemes/company';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Divider, Form, Input, Select, Skeleton } from 'antd';
import type { ChangeEvent } from 'react';
import useSWR from 'swr';

export const VerifyCompany = ({
  ...props
}: {
  company: CompanyApi | Record<string, never> | undefined;
  form: FormInstance<CompanyFormValues>;
  type: 'internal' | 'external';
}) => {
  const { data: paymentAccounts, isLoading: loadingAccounts } = useSWR(
    'companies/payment-accounts',
    () => PaymentAccountService.getAll()
  );

  const accountOptions =
    paymentAccounts?.map((a) => ({
      label: `${a.bank_name}: ${a.bank_account}`,
      value: a.id,
    })) ?? [];

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');

    const normalized = digits.startsWith('8') ? '7' + digits.slice(1) : digits;

    if (normalized.length === 0) {
      return '';
    }

    let result = '+7';

    if (normalized.length > 1) {
      result += ' (' + normalized.slice(1, 4);
    }

    if (normalized.length >= 4) {
      result += ')';
    }

    if (normalized.length > 4) {
      result += ' ' + normalized.slice(4, 7);
    }

    if (normalized.length > 7) {
      result += '-' + normalized.slice(7, 9);
    }

    if (normalized.length > 9) {
      result += '-' + normalized.slice(9, 11);
    }

    return result;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formatted = formatPhoneNumber(value);

    props.form.setFieldsValue({ phone: formatted || null });

    requestAnimationFrame(() => {
      if (e.target) {
        const cursorPos = formatted.length;
        e.target.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  const schema = companyFormValuesSchema;

  return (
    <Form<CompanyFormValues> layout="vertical" form={props.form}>
      <Title level={2}>{props.type === 'internal' ? 'Филиал' : 'Юридическое лицо'}</Title>
      {props.company !== undefined ? (
        <>
          <Form.Item<CompanyFormValues>
            label="Название"
            name={'name'}
            rules={getValidationRules(schema, 'name')}
          >
            <Input />
          </Form.Item>

          <Form.Item<CompanyFormValues>
            label="Сокращённое название"
            name={'short_name'}
            rules={getValidationRules(schema, 'short_name', false)}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="ИНН"
            name={'inn'}
            rules={getValidationRules(schema, 'inn')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="КПП"
            name={'kpp'}
            rules={getValidationRules(schema, 'kpp', false)}
          >
            <Input className="w-full!" allowClear />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="ОГРН"
            name={'ogrn'}
            rules={getValidationRules(schema, 'ogrn')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="Юридический адрес"
            name={'legal_address'}
            rules={getValidationRules(schema, 'legal_address')}
          >
            <Input />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="Почтовый адрес"
            name={'postal_address'}
            rules={getValidationRules(schema, 'postal_address', false)}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="Телефон"
            name={'phone'}
            rules={getValidationRules(schema, 'phone', false)}
          >
            <Input
              onChange={handlePhoneChange}
              placeholder="+7 (___) ___-__-__"
              maxLength={18}
              allowClear
            />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="Адрес электронной почты"
            name={'email'}
            rules={getValidationRules(schema, 'email', false)}
          >
            <Input allowClear />
          </Form.Item>

          <Divider orientation="left">Платёжные счета</Divider>
          <Form.Item<CompanyFormValues>
            label="Привязанные счета"
            name="payment_account_ids"
            tooltip="Создание и редактирование счетов — в разделе «Расчётные счета»"
          >
            <Select
              mode="multiple"
              allowClear
              loading={loadingAccounts}
              optionFilterProp="label"
              options={accountOptions}
              placeholder="Выберите счета из справочника"
            />
          </Form.Item>

          <Form.Item<CompanyFormValues>
            label="Директор"
            name={'director_name'}
            rules={getValidationRules(schema, 'director_name', false)}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item<CompanyFormValues>
            label="Должность директора"
            name={'director_position'}
            rules={getValidationRules(schema, 'director_position')}
          >
            <Input />
          </Form.Item>
        </>
      ) : (
        <Skeleton active className="mt-10" />
      )}
    </Form>
  );
};

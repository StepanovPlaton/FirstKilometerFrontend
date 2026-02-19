import { Title } from '@/shared/ui/title';
import { baseCompanySchema, type BaseCompany } from '@/shared/utils/schemes/company';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Form, Input, Skeleton } from 'antd';
import type { ChangeEvent } from 'react';

export const VerifyCompany = ({
  ...props
}: {
  company: BaseCompany | undefined;
  form: FormInstance<BaseCompany>;
  type: 'internal' | 'external';
  
}) => {
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');

    const normalized = digits.startsWith('8') 
      ? '7' + digits.slice(1) 
      : digits;

    let result = '';

    if (normalized.length === 0) {
      return '';
    }

    // +7
    result = '+7';
    
    if (normalized.length > 1) {
      // +7 (XXX
      result += ' (' + normalized.slice(1, 4);
    }
    
    if (normalized.length >= 4) {
      // +7 (XXX)
      result += ')';
    }
    
    if (normalized.length > 4) {
      // +7 (XXX) XXX
      result += ' ' + normalized.slice(4, 7);
    }
    
    if (normalized.length > 7) {
      // +7 (XXX) XXX-XX
      result += '-' + normalized.slice(7, 9);
    }
    
    if (normalized.length > 9) {
      // +7 (XXX) XXX-XX-XX
      result += '-' + normalized.slice(9, 11);
    }

    return result;
  };

  const handlePhoneChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const formatted = formatPhoneNumber(value);

    props.form.setFieldsValue({ phone: formatted });

    requestAnimationFrame(() => {
      if (e.target) {
        const cursorPos = formatted.length;
        e.target.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  return (
    <Form<BaseCompany> layout="vertical" form={props.form}>
      <Title level={2}>{props.type === 'internal' ? 'Филиал' : 'Юридическое лицо'}</Title>
      {props.company ? (
        <>
          <Form.Item<BaseCompany>
            label="Название"
            name={'name'}
            rules={getValidationRules(baseCompanySchema, 'name')}
          >
            <Input />
          </Form.Item>

          <Form.Item<BaseCompany>
            label="Сокращённое название"
            name={'short_name'}
            rules={getValidationRules(baseCompanySchema, 'short_name')}
          >
            <Input />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="ИНН"
            name={'inn'}
            rules={getValidationRules(baseCompanySchema, 'inn')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="КПП"
            name={'kpp'}
            rules={getValidationRules(baseCompanySchema, 'kpp')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="ОГРН"
            name={'ogrn'}
            rules={getValidationRules(baseCompanySchema, 'ogrn')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Юридический адрес"
            name={'legal_address'}
            rules={getValidationRules(baseCompanySchema, 'legal_address')}
          >
            <Input />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Почтовый адрес"
            name={'postal_address'}
            rules={getValidationRules(baseCompanySchema, 'postal_address')}
          >
            <Input />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Телефон"
            name={'phone'}
            rules={getValidationRules(baseCompanySchema, 'phone')}
          >
            <Input
              onChange={handlePhoneChange}
              placeholder="+7 (___) ___-__-__"
              maxLength={18}
            />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Адрес электронной почты"
            name={'email'}
            rules={getValidationRules(baseCompanySchema, 'email')}
          >
            <Input />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Номер расчётного счёта"
            name={'bank_account'}
            rules={getValidationRules(baseCompanySchema, 'bank_account')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="БИК"
            name={'bik'}
            rules={getValidationRules(baseCompanySchema, 'bik')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Название банка"
            name={'bank_name'}
            rules={getValidationRules(baseCompanySchema, 'bank_name')}
          >
            <Input />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Корреспондентский счёт"
            name={'corr_account'}
            rules={getValidationRules(baseCompanySchema, 'corr_account')}
          >
            <Input className="w-full!" />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Директор"
            name={'director_name'}
            rules={getValidationRules(baseCompanySchema, 'director_name')}
          >
            <Input />
          </Form.Item>
          <Form.Item<BaseCompany>
            label="Должность директора"
            name={'director_position'}
            rules={getValidationRules(baseCompanySchema, 'director_position')}
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

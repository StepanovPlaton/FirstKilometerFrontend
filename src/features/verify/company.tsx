import { Title } from '@/shared/ui/title';
import { baseCompanySchema, type BaseCompany } from '@/shared/utils/schemes/company';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Form, Input, Skeleton } from 'antd';

export const VerifyCompany = ({
  ...props
}: {
  company: BaseCompany | undefined;
  form: FormInstance<BaseCompany>;
  type: 'internal' | 'external';
}) => {
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
            <Input />
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

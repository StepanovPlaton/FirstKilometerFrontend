import type { Company } from '@/entities/company';
import { companySchema } from '@/entities/company';
import { Title } from '@/shared/ui/title';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Col, Form, Input, InputNumber, Row, Skeleton } from 'antd';

export const VerifyCompany = ({
  ...props
}: {
  company: Company | undefined;
  form: FormInstance<Company>;
}) => {
  return (
    <Form<Company> layout="vertical" form={props.form}>
      <Title level={2}>Компания</Title>
      {props.company ? (
        <>
          <Form.Item<Company>
            label="Название"
            name={'name'}
            rules={getValidationRules(companySchema, 'name')}
          >
            <Input className="w-100!" />
          </Form.Item>

          <Form.Item<Company>
            label="Сокращённое название"
            name={'short_name'}
            rules={getValidationRules(companySchema, 'short_name')}
          >
            <Input className="w-50!" />
          </Form.Item>
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item<Company>
                label="ИНН"
                name={'inn'}
                rules={getValidationRules(companySchema, 'inn')}
              >
                <InputNumber className="w-30!" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<Company>
                label="БИК"
                name={'bik'}
                rules={getValidationRules(companySchema, 'bik')}
              >
                <InputNumber className="w-30!" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item<Company>
                label="КПП"
                name={'kpp'}
                rules={getValidationRules(companySchema, 'kpp')}
              >
                <InputNumber className="w-30!" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<Company>
                label="ОРГН"
                name={'ogrn'}
                rules={getValidationRules(companySchema, 'ogrn')}
              >
                <InputNumber className="w-30!" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item<Company>
            label="Юридический адрес"
            name={'legal_address'}
            rules={getValidationRules(companySchema, 'legal_address')}
          >
            <Input className="w-100!" />
          </Form.Item>
          <Form.Item<Company>
            label="Почтовый адрес"
            name={'postal_address'}
            rules={getValidationRules(companySchema, 'postal_address')}
          >
            <Input className="w-100!" />
          </Form.Item>
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item<Company>
                label="Телефон"
                name={'phone'}
                rules={getValidationRules(companySchema, 'phone')}
              >
                <Input className="w-50!" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item<Company>
                label="Адрес электронной почты"
                name={'email'}
                rules={getValidationRules(companySchema, 'email')}
              >
                <Input className="w-50!" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={4}>
            <Col span={12}>
              <Form.Item<Company>
                label="Номер расчётного счёта"
                name={'bank_account'}
                rules={getValidationRules(companySchema, 'bank_account')}
              >
                <InputNumber className="w-50!" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<Company>
                label="Название банка"
                name={'bank_name'}
                rules={getValidationRules(companySchema, 'bank_name')}
              >
                <Input className="w-50!" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item<Company>
            label="Корреспондентский счёт"
            name={'corr_account'}
            rules={getValidationRules(companySchema, 'corr_account')}
          >
            <InputNumber className="w-50!" />
          </Form.Item>
          <Row gutter={4}>
            <Col span={12}>
              <Form.Item<Company>
                label="Директор"
                name={'director_name'}
                rules={getValidationRules(companySchema, 'director_name')}
              >
                <Input className="w-50!" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item<Company>
                label="Должность директора"
                name={'director_position'}
                rules={getValidationRules(companySchema, 'director_position')}
              >
                <Input className="w-50!" />
              </Form.Item>
            </Col>
          </Row>
        </>
      ) : (
        <Skeleton active className="mt-10" />
      )}
    </Form>
  );
};

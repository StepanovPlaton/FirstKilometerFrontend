import type { ApiUser, FormUser } from '@/entities/user';
import { formUserSchema } from '@/entities/user';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { Card, DatePicker, Divider, Flex, Form, Image, Input, Row, Select, Skeleton } from 'antd';
import clsx from 'clsx';

export const UserCard = (props: { user: ApiUser | undefined; form: FormInstance<FormUser> }) => {
  return (
    <Form<FormUser> layout="vertical" className="w-full" form={props.form}>
      <Card className="w-350 max-w-full">
        <div className="flex w-full">
          <Flex vertical align="center" className="w-1/2" gap={8}>
            <Title level={2}>Документы клиента</Title>
            <Text>Паспорт клиента (главная страница)</Text>
            <div className="aspect-video w-full px-4">
              {props.user ? (
                <Image
                  src={props.user.passport_url ?? '/demo/passport_main.jpg'}
                  alt="Главная страница паспорта клиента"
                  className={clsx('rounded shadow-lg!', !props.user.reg_url && 'opacity-30')}
                />
              ) : (
                <Skeleton.Node active className="h-full! w-full! p-2" />
              )}
            </div>
          </Flex>
          <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
          <div className="w-1/2">
            <Flex justify="space-around">
              <Title level={2}>Данные клиента</Title>
            </Flex>
            {props.user ? (
              <>
                <Row wrap justify={'space-evenly'}>
                  <Form.Item<FormUser>
                    label="Фамилия"
                    name={'last_name'}
                    rules={getValidationRules(formUserSchema, 'last_name')}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Имя"
                    name={'first_name'}
                    rules={getValidationRules(formUserSchema, 'first_name')}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Отчество"
                    name={'middle_name'}
                    rules={getValidationRules(formUserSchema, 'middle_name', false)}
                  >
                    <Input />
                  </Form.Item>
                </Row>
                <Row justify="space-evenly" wrap>
                  <Form.Item<FormUser>
                    label="Пол"
                    name={'sex'}
                    rules={getValidationRules(formUserSchema, 'sex')}
                  >
                    <Select
                      placeholder="Пол"
                      options={[
                        { value: 'М', label: 'М' },
                        { value: 'Ж', label: 'Ж' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Дата рождения"
                    name={'birth_date'}
                    rules={getValidationRules(formUserSchema, 'birth_date')}
                  >
                    <DatePicker format="DD.MM.YYYY" />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Место рождения"
                    name={'birth_place'}
                    rules={getValidationRules(formUserSchema, 'birth_place')}
                  >
                    <Input className="w-80!" />
                  </Form.Item>
                </Row>
                <Divider className="m-2!" />
                <Row justify="space-evenly" wrap>
                  <Form.Item<FormUser>
                    label="Кем выдан паспорт"
                    name={'issue_organization'}
                    className="w-full"
                    rules={getValidationRules(formUserSchema, 'issue_organization')}
                  >
                    <Input className="w-full" />
                  </Form.Item>
                </Row>
                <Row justify="space-evenly" wrap>
                  <Form.Item<FormUser>
                    label="Дата выдачи"
                    name={'issue_date'}
                    rules={getValidationRules(formUserSchema, 'issue_date')}
                  >
                    <DatePicker format="DD.MM.YYYY" />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Код подразделения"
                    name={'issue_organization_code'}
                    rules={getValidationRules(formUserSchema, 'issue_organization_code')}
                  >
                    <Input />
                  </Form.Item>
                </Row>
                <Divider className="m-2!" />
                <Row justify="space-evenly" wrap>
                  <Form.Item<FormUser>
                    label="Серия и номер паспорта"
                    name={'licence_number'}
                    rules={getValidationRules(formUserSchema, 'licence_number')}
                  >
                    <Input />
                  </Form.Item>
                </Row>
              </>
            ) : (
              <Skeleton active className="mt-10" />
            )}
          </div>
        </div>
        <Divider className="m-2!" />
        <div className="flex w-full">
          <Flex vertical align="center" className="w-1/2" gap={8}>
            <Text>Паспорт клиента (прописка)</Text>
            <div className="aspect-video w-full px-4">
              {props.user ? (
                <Image
                  src={props.user.reg_url ?? '/demo/passport_registration.jpg'}
                  alt="Второй разворот паспорта клиента"
                  className={clsx('rounded shadow-lg!', !props.user.reg_url && 'opacity-30')}
                />
              ) : (
                <Skeleton.Node active className="h-full! w-full! p-2" />
              )}
            </div>
          </Flex>
          <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
          <div className="w-1/2">
            {props.user ? (
              <>
                <Row wrap justify={'space-evenly'}>
                  <Form.Item<FormUser>
                    label="Дата регистрации"
                    name={'registration_date'}
                    rules={getValidationRules(formUserSchema, 'registration_date')}
                  >
                    <DatePicker format="DD MMMM YYYYг." />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Регион"
                    name={'registration_region'}
                    rules={getValidationRules(formUserSchema, 'registration_region')}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Населённый пункт"
                    name={'registration_settlement'}
                    rules={getValidationRules(formUserSchema, 'registration_settlement')}
                  >
                    <Input />
                  </Form.Item>
                </Row>
                <Row justify="space-evenly" wrap>
                  <Form.Item<FormUser>
                    label="Район"
                    name={'registration_district'}
                    rules={getValidationRules(formUserSchema, 'registration_district', false)}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Участок"
                    name={'registration_area'}
                    rules={getValidationRules(formUserSchema, 'registration_area', false)}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item<FormUser>
                    label="Улица"
                    name={'registration_street'}
                    rules={getValidationRules(formUserSchema, 'registration_street')}
                  >
                    <Input />
                  </Form.Item>
                </Row>
                <Row justify="space-evenly" wrap>
                  <Form.Item<FormUser>
                    label="Адрес"
                    name={'registration_address'}
                    rules={getValidationRules(formUserSchema, 'registration_address')}
                  >
                    <Input className="w-64!" />
                  </Form.Item>
                </Row>
              </>
            ) : (
              <Skeleton active className="mt-10" />
            )}
          </div>
        </div>
      </Card>
    </Form>
  );
};

import { Viewer } from '@/features/viewer';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import type { ApiPerson, FormPerson } from '@/shared/utils/schemes/person';
import { formPersonSchema } from '@/shared/utils/schemes/person';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import { DatePicker, Divider, Flex, Form, Input, Row, Select, Skeleton } from 'antd';
import clsx from 'clsx';
import type { FormEventHandler } from 'react';

const toUpperCase: FormEventHandler<HTMLInputElement> = (e) =>
  ((e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase());

export const VerifyPerson = ({
  ...props
}: {
  person: ApiPerson | undefined;
  form: FormInstance<FormPerson>;
  type: 'user' | 'individual';
}) => {
  return (
    <Form<FormPerson> layout="vertical" form={props.form}>
      <div className="flex w-full">
        <Flex vertical align="center" className="w-1/2" gap={8}>
          <Title level={2}>Документы {props.type === 'user' ? 'клиента' : 'физ. лица'}</Title>
          <Text>Паспорт {props.type === 'user' ? 'клиента' : 'физ. лица'} (главная страница)</Text>
          <div className="aspect-video w-full px-4">
            <Viewer
              active={!!props.person}
              url={props.person?.passport_url}
              alt={`Главная страница паспорта ${props.type === 'user' ? 'клиента' : 'физ. лица'}`}
              imageClassName={clsx('rounded shadow-lg!', !props.person?.reg_url && 'opacity-30')}
              skeletonClassName="h-full! w-full! p-2"
            />
          </div>
        </Flex>
        <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
        <div className="w-1/2">
          <Flex justify="space-around">
            <Title level={2}>Данные {props.type === 'user' ? 'клиента' : 'физ. лица'}</Title>
          </Flex>
          {props.person ? (
            <>
              <Row wrap justify={'space-evenly'}>
                <Form.Item<FormPerson>
                  label="Фамилия"
                  name={'last_name'}
                  rules={getValidationRules(formPersonSchema, 'last_name')}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Имя"
                  name={'first_name'}
                  rules={getValidationRules(formPersonSchema, 'first_name')}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Отчество"
                  name={'middle_name'}
                  rules={getValidationRules(formPersonSchema, 'middle_name', false)}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Пол"
                  name={'sex'}
                  rules={getValidationRules(formPersonSchema, 'sex')}
                >
                  <Select
                    placeholder="Пол"
                    options={[
                      { value: 'М', label: 'М' },
                      { value: 'Ж', label: 'Ж' },
                    ]}
                  />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Дата рождения"
                  name={'birth_date'}
                  rules={getValidationRules(formPersonSchema, 'birth_date')}
                >
                  <DatePicker format="DD.MM.YYYY" />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Место рождения"
                  name={'birth_place'}
                  rules={getValidationRules(formPersonSchema, 'birth_place')}
                >
                  <Input className="w-80!" onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Divider className="m-2!" />
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Кем выдан паспорт"
                  name={'issue_organization'}
                  className="w-full"
                  rules={getValidationRules(formPersonSchema, 'issue_organization')}
                >
                  <Input className="w-full" onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Дата выдачи"
                  name={'issue_date'}
                  rules={getValidationRules(formPersonSchema, 'issue_date')}
                >
                  <DatePicker format="DD.MM.YYYY" />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Код подразделения"
                  name={'issue_organization_code'}
                  rules={getValidationRules(formPersonSchema, 'issue_organization_code')}
                >
                  <Input />
                </Form.Item>
              </Row>
              <Divider className="m-2!" />
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Серия и номер паспорта"
                  name={'licence_number'}
                  rules={getValidationRules(formPersonSchema, 'licence_number')}
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
          <Text>Паспорт {props.type === 'user' ? 'клиента' : 'физ. лица'} (прописка)</Text>
          <div className="aspect-video w-full px-4">
            <Viewer
              active={!!props.person}
              url={props.person?.reg_url}
              alt={`Второй разворот паспорта ${props.type === 'user' ? 'клиента' : 'физ. лица'}`}
              imageClassName={clsx('rounded shadow-lg!', !props.person?.reg_url && 'opacity-30')}
              skeletonClassName="h-full! w-full! p-2"
            />
          </div>
        </Flex>
        <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
        <div className="w-1/2">
          {props.person ? (
            <>
              <Row wrap justify={'space-evenly'}>
                <Form.Item<FormPerson>
                  label="Дата регистрации"
                  name={'registration_date'}
                  rules={getValidationRules(formPersonSchema, 'registration_date')}
                >
                  <DatePicker format="DD MMMM YYYYг." />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Регион"
                  name={'registration_region'}
                  rules={getValidationRules(formPersonSchema, 'registration_region')}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Населённый пункт"
                  name={'registration_settlement'}
                  rules={getValidationRules(formPersonSchema, 'registration_settlement')}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Район"
                  name={'registration_district'}
                  rules={getValidationRules(formPersonSchema, 'registration_district', false)}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Участок"
                  name={'registration_area'}
                  rules={getValidationRules(formPersonSchema, 'registration_area', false)}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
                <Form.Item<FormPerson>
                  label="Улица"
                  name={'registration_street'}
                  rules={getValidationRules(formPersonSchema, 'registration_street')}
                >
                  <Input onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Дом, квартира, корпус"
                  name={'registration_address'}
                  rules={getValidationRules(formPersonSchema, 'registration_address')}
                >
                  <Input className="w-64!" onInput={toUpperCase} />
                </Form.Item>
              </Row>
            </>
          ) : (
            <Skeleton active className="mt-10" />
          )}
        </div>
      </div>
    </Form>
  );
};

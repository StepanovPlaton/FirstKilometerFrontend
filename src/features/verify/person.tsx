import { Viewer } from '@/features/viewer';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import type { Choice } from '@/shared/utils/schemes';
import type { ApiPerson, FormPerson } from '@/shared/utils/schemes/person';
import { formPersonSchema } from '@/shared/utils/schemes/person';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { CRUDCService } from '@/shared/utils/services';
import type { FormInstance } from 'antd';
import {
  AutoComplete,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Skeleton,
} from 'antd';
import type { NamePath } from 'antd/es/form/interface';
import TextArea from 'antd/es/input/TextArea';
import clsx from 'clsx';
import { useState } from 'react';

export const VerifyPerson = <T extends CRUDCService<ApiPerson>>({
  ...props
}: {
  person: ApiPerson | undefined;
  form: FormInstance<FormPerson>;
  service: T;
  onPersonChange?: (person: ApiPerson['uuid']) => unknown;
}) => {
  const toUpperCase = (field: NamePath<FormPerson>) =>
    props.form.setFieldValue(field, (props.form.getFieldValue(field) as string).toUpperCase());

  const { data: persons } = useChoices(props.service);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [changeToPerson, setChangeToPerson] = useState<Choice>();
  const [inputLicenceNumber, setInputLicenceNumber] = useState<ApiPerson['licence_number']>();

  const change = () => {
    if (!changeToPerson || !props.person) {
      return;
    }
    void props.service.delete(props.person?.uuid).then(() => {
      props.onPersonChange?.(String(changeToPerson.value));
      setConfirmDelete(false);
      setChangeToPerson(undefined);
    });
  };

  return (
    <Form<FormPerson> layout="vertical" form={props.form}>
      <div className="flex w-full">
        <Flex vertical align="center" className="w-2/3" gap={8}>
          <Title level={2}>Документы физ. лица</Title>
          <Text>Паспорт физ. лица (главная страница)</Text>
          <div className="aspect-video w-full px-4">
            <Viewer
              active={!!props.person}
              url={props.person?.passport_url}
              alt="Главная страница паспорта физ. лица"
              imageClassName={clsx('rounded shadow-lg!', !props.person?.reg_url && 'opacity-30')}
              skeletonClassName="h-full! w-full! p-2"
            />
          </div>
        </Flex>
        <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
        <div className="w-1/3">
          <Flex justify="space-around">
            <Title level={2}>Данные физ. лица</Title>
          </Flex>
          {props.person ? (
            <>
              <Row justify="start" wrap className="w-full!">
                {/* <Spin spinning={loading} className="w-full!"> */}
                <Form.Item<FormPerson>
                  label="Серия и номер паспорта"
                  name={'licence_number'}
                  rules={getValidationRules(formPersonSchema, 'licence_number')}
                  className="w-full"
                >
                  <AutoComplete
                    className="w-full!"
                    options={
                      inputLicenceNumber && props.onPersonChange
                        ? (persons ?? []).filter((o) => o.value !== props.person?.uuid)
                        : []
                    }
                    onSelect={(_, option: Choice) => {
                      setConfirmDelete(true);
                      setChangeToPerson(option);
                    }}
                    onChange={(e: string) => setInputLicenceNumber(e)}
                    filterOption={(input, option) =>
                      option?.label.split('(')[1]?.split(')')[0] === input
                    }
                  />
                </Form.Item>
                <Modal
                  open={confirmDelete}
                  onCancel={() => setConfirmDelete(false)}
                  title={<Title level={2}>Замена пользователя</Title>}
                  width={450}
                  okText="Использовать"
                  okButtonProps={{ danger: true }}
                  onOk={change}
                >
                  <Text>Похоже, что пользователь с такими паспортными данными уже существует</Text>
                  <Title level={5}>Использовать уже добавленного пользователя?</Title>
                  <Text>Текущий пользователь будет удалён. Загрузится {changeToPerson?.label}</Text>
                </Modal>
                {/* </Spin> */}
              </Row>
              <Row wrap justify="start" className="w-full">
                <Form.Item<FormPerson>
                  label="Фамилия"
                  name={'last_name'}
                  rules={getValidationRules(formPersonSchema, 'last_name')}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('last_name')} className="w-full" />
                </Form.Item>
              </Row>
              <Row wrap justify="start" className="w-full">
                <Form.Item<FormPerson>
                  label="Имя"
                  name={'first_name'}
                  rules={getValidationRules(formPersonSchema, 'first_name')}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('first_name')} className="w-full" />
                </Form.Item>
              </Row>
              <Row wrap justify="start" className="w-full">
                <Form.Item<FormPerson>
                  label="Отчество"
                  name={'middle_name'}
                  rules={getValidationRules(formPersonSchema, 'middle_name', false)}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('middle_name')} className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="start" wrap className="w-full">
                <Col span={12} className="pr-4">
                  <Form.Item<FormPerson>
                    label="Пол"
                    name={'sex'}
                    rules={getValidationRules(formPersonSchema, 'sex')}
                    className="w-full"
                  >
                    <Select
                      placeholder="Пол"
                      options={[
                        { value: 'М', label: 'М' },
                        { value: 'Ж', label: 'Ж' },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<FormPerson>
                    label="Дата рождения"
                    name={'birth_date'}
                    rules={getValidationRules(formPersonSchema, 'birth_date')}
                    className="w-full"
                  >
                    <DatePicker format="DD.MM.YYYY" className="w-full" />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="start" wrap className="w-full gap-4">
                <Form.Item<FormPerson>
                  label="Место рождения"
                  name={'birth_place'}
                  rules={getValidationRules(formPersonSchema, 'birth_place')}
                  className="w-full"
                >
                  <Input className="w-full" onBlur={() => toUpperCase('birth_place')} />
                </Form.Item>
              </Row>
              <Row justify="start" wrap className="w-full">
                <Form.Item<FormPerson>
                  label="Кем выдан паспорт"
                  name={'issue_organization'}
                  className="w-full"
                  rules={getValidationRules(formPersonSchema, 'issue_organization')}
                >
                  <TextArea
                    rows={1}
                    className="field-sizing-content! w-full"
                    onBlur={() => toUpperCase('issue_organization')}
                  />
                </Form.Item>
              </Row>
              <Row justify="start" wrap className="w-full">
                <Col span={12} className="pr-4">
                  <Form.Item<FormPerson>
                    label="Дата выдачи"
                    name={'issue_date'}
                    rules={getValidationRules(formPersonSchema, 'issue_date')}
                    className="w-full"
                  >
                    <DatePicker format="DD.MM.YYYY" className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<FormPerson>
                    label="Код подразделения"
                    name={'issue_organization_code'}
                    rules={getValidationRules(formPersonSchema, 'issue_organization_code')}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="start" wrap className="w-full">
                <Form.Item<FormPerson>
                  label="Номер телефона"
                  name={'phone'}
                  rules={getValidationRules(formPersonSchema, 'phone')}
                  className="w-full"
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
        <Flex vertical align="center" className="w-2/3" gap={8}>
          <Text>Паспорт физ. лица (прописка)</Text>
          <div className="aspect-video w-full px-4">
            <Viewer
              active={!!props.person}
              url={props.person?.reg_url}
              alt="Второй разворот паспорта физ. лица"
              imageClassName={clsx('rounded shadow-lg!', !props.person?.reg_url && 'opacity-30')}
              skeletonClassName="h-full! w-full! p-2"
            />
          </div>
        </Flex>
        <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
        <div className="w-1/3">
          {props.person ? (
            <>
              <Row wrap justify="start" className="w-full">
                <Form.Item<FormPerson>
                  label="Дата регистрации"
                  name={'registration_date'}
                  rules={getValidationRules(formPersonSchema, 'registration_date')}
                  className="w-full"
                >
                  <DatePicker format={['DD MMMM YYYYг.', 'DD.MM.YYYY']} className="w-full" />
                </Form.Item>
              </Row>
              <Row wrap justify="start" className="w-full">
                <Form.Item<FormPerson>
                  label="Регион"
                  name={'registration_region'}
                  rules={getValidationRules(formPersonSchema, 'registration_region')}
                  className="w-full"
                >
                  <TextArea
                    rows={1}
                    className="field-sizing-content! w-full"
                    onBlur={() => toUpperCase('registration_region')}
                  />
                </Form.Item>
              </Row>
              <Row wrap justify="start" className="w-full">
                <Form.Item<FormPerson>
                  label="Населённый пункт"
                  name={'registration_settlement'}
                  rules={getValidationRules(formPersonSchema, 'registration_settlement')}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('registration_settlement')} className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Район"
                  name={'registration_district'}
                  rules={getValidationRules(formPersonSchema, 'registration_district', false)}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('registration_district')} className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Участок"
                  name={'registration_area'}
                  rules={getValidationRules(formPersonSchema, 'registration_area', false)}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('registration_area')} className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Улица"
                  name={'registration_street'}
                  rules={getValidationRules(formPersonSchema, 'registration_street')}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('registration_street')} className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="space-evenly" wrap>
                <Form.Item<FormPerson>
                  label="Дом, квартира, корпус"
                  name={'registration_address'}
                  rules={getValidationRules(formPersonSchema, 'registration_address')}
                  className="w-full"
                >
                  <Input onBlur={() => toUpperCase('registration_address')} className="w-full" />
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

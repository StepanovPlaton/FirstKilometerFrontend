'use client';

import { formVehicleSchema, type ApiVehicle, type FormVehicle } from '@/entities/vehicle';
import { Viewer } from '@/features/viewer';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import { getValidationRules } from '@/shared/utils/schemes/validator';
import type { FormInstance } from 'antd';
import {
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
} from 'antd';
import clsx from 'clsx';
import type { FormEventHandler } from 'react';
import { useState } from 'react';

const baseVehicleTypes = [
  'Легковой',
  'Грузовой',
  'Автобус',
  'Мотоцикл',
  'Прицеп',
  'Полуприцеп',
  'Специальный',
];

const toUpperCase: FormEventHandler<HTMLInputElement> = (e) =>
  ((e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase());

export const VerifyVehicle = (props: {
  vehicle: ApiVehicle | undefined;
  form: FormInstance<FormVehicle>;
}) => {
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(baseVehicleTypes);

  return (
    <Form<FormVehicle> layout="vertical" form={props.form}>
      <div className="flex w-full">
        <Flex vertical align="center" className="w-2/3" gap={8}>
          <Title level={2}>Документы транспортного средства</Title>
          <Text>Паспорт транспортного средства</Text>
          <div className="h-full w-full px-4">
            <Viewer
              active={!!props.vehicle}
              url={props.vehicle?.pts_url}
              alt="Паспорт транспортного средства"
              imageClassName={clsx('rounded shadow-lg!', !props.vehicle?.pts_url && 'opacity-30')}
              skeletonClassName="h-full! min-h-64 w-full! p-2"
            />
          </div>
        </Flex>
        <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
        <div className="w-1/3">
          <Flex justify="space-around">
            <Title level={2}>Данные ТС</Title>
          </Flex>
          {props.vehicle ? (
            <>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Номер ПТС"
                  name={'pts_id'}
                  rules={getValidationRules(formVehicleSchema, 'pts_id')}
                  className="w-full"
                >
                  <Input className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Индификационный номер (VIN)"
                  name={'vin'}
                  rules={getValidationRules(formVehicleSchema, 'vin')}
                  className="w-full"
                >
                  <Input onInput={toUpperCase} className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Марка, модель ТС"
                  name={'make_model'}
                  rules={getValidationRules(formVehicleSchema, 'make_model')}
                  className="w-full"
                >
                  <Input className="w-full" onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Наименование (тип ТС)"
                  name={'type'}
                  rules={getValidationRules(formVehicleSchema, 'type')}
                  className="w-full"
                >
                  <Select
                    options={vehicleTypes.map((type) => ({ value: type, label: type }))}
                    showSearch
                    onSearch={(v) =>
                      setVehicleTypes([...baseVehicleTypes, ...(v !== '' ? [v] : [])])
                    }
                  />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Год изготовления ТС"
                  name={'year'}
                  rules={getValidationRules(formVehicleSchema, 'year')}
                  className="w-full"
                >
                  <InputNumber className="w-full!" />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Модель, № двигателя"
                  name={'engine'}
                  rules={getValidationRules(formVehicleSchema, 'engine')}
                  className="w-full"
                >
                  <Input className="w-full" onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Шасси (рама) №"
                  name={'chassis'}
                  rules={getValidationRules(formVehicleSchema, 'chassis')}
                  className="w-full"
                >
                  <Input className="w-full" onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Кузов (кабина, прицеп) №"
                  name={'body'}
                  rules={getValidationRules(formVehicleSchema, 'body')}
                  className="w-full"
                >
                  <Input className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Цвет кузова (кабины, прицепа)"
                  name={'color'}
                  rules={getValidationRules(formVehicleSchema, 'color')}
                  className="w-full"
                >
                  <Input className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Дата выдачи ПТС"
                  name={'pts_date'}
                  rules={getValidationRules(formVehicleSchema, 'pts_date')}
                  className="w-full"
                >
                  <DatePicker format={['DD MMMM YYYY г.', 'DD.MM.YYYY']} className="w-full!" />
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
          {(props.vehicle?.sts_front_url || props.vehicle?.sts_back_url) && (
            <Text>Свидетельство о регистрации транспортного средства</Text>
          )}
          <div className="aspect-video w-full px-4">
            <Row>
              <Col span={12}>
                <Viewer
                  active={!!props.vehicle}
                  url={props.vehicle?.sts_front_url}
                  alt="Свидетельство о регистрации транспортного средства"
                  imageClassName="rounded shadow-lg!"
                  skeletonClassName="h-full! min-h-40 w-full! p-2"
                />
              </Col>
              <Col span={12}>
                <Viewer
                  active={!!props.vehicle}
                  url={props.vehicle?.sts_back_url}
                  alt="Свидетельство о регистрации транспортного средства (обратная сторона)"
                  imageClassName="rounded shadow-lg!"
                  skeletonClassName="h-full! min-h-40 w-full! p-2"
                />
              </Col>
            </Row>
          </div>
        </Flex>
        <div className="mx-4 min-h-20 w-[2px] bg-gray-300" />
        <div className="w-1/3">
          {props.vehicle ? (
            <>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Номер СТС"
                  name={'sts_id'}
                  className="w-full"
                  rules={getValidationRules(formVehicleSchema, 'sts_id')}
                >
                  <Input className="w-full" />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Регистрационный знак (номер)"
                  name={'reg_number'}
                  rules={getValidationRules(formVehicleSchema, 'reg_number')}
                  className="w-full"
                >
                  <Input className="w-full" onInput={toUpperCase} />
                </Form.Item>
              </Row>
              <Row justify="start" className="w-full">
                <Form.Item<FormVehicle>
                  label="Дата выдачи СТС"
                  name={'sts_date'}
                  rules={getValidationRules(formVehicleSchema, 'sts_date')}
                  className="w-full"
                >
                  <DatePicker format={['DD MMMM YYYYг.', 'DD.MM.YYYY']} className="w-full!" />
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

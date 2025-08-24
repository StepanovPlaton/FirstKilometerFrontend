'use client';

import type { ApiVehicle, FormVehicle } from '@/entities/vehicle';
import VehicleService, { formVehicleSchema } from '@/entities/vehicle';
import { VerifyVehicle } from '@/features/verify/vehicle';
import { useEntities } from '@/shared/utils/hooks/data';
import { Form, message, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

const columns: ColumnsType<ApiVehicle> = [
  { key: 'pts_id', title: 'ПТС', dataIndex: 'pts_id' },
  { key: 'vin', title: 'VIN', dataIndex: 'vin' },
  { key: 'make_model', title: 'Марка и модель ТС', dataIndex: 'make_model' },
  { key: 'color', title: 'Цвет', dataIndex: 'color' },
];

export default function VehiclesTablesPage() {
  const { data: vehicles, loading, mutate: mutateTable } = useEntities(VehicleService);
  const [vehicle, setVehicle] = useState<ApiVehicle>();
  const [messageApi, contextHolder] = message.useMessage();
  const [vehicleForm] = Form.useForm<FormVehicle>();
  useEffect(() => {
    vehicleForm.setFieldsValue(vehicle as never as FormVehicle);
  }, [vehicle, vehicleForm]);

  const submitVehicle = (values: FormVehicle) => {
    const validatedForm = formVehicleSchema.safeParse({ ...values, uuid: vehicle?.uuid });
    if (validatedForm.success) {
      return VehicleService.putAny(validatedForm.data)
        .then((vehicle) =>
          mutateTable((vehicles) => vehicles?.map((v) => (v.uuid === vehicle.uuid ? vehicle : v)))
        )
        .catch((e) => {
          messageApi.error(
            'Не удалось сохранить данные транспортного средства. Повторите попытку позже'
          );
          throw e;
        });
    } else {
      messageApi.error('Данные транспортного средства заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  return (
    <>
      <Table<ApiVehicle>
        className="w-full"
        rowKey="uuid"
        loading={loading}
        columns={columns}
        dataSource={vehicles ?? ([] as ApiVehicle[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setVehicle(record),
          };
        }}
      />
      <Modal
        open={!!vehicle}
        width={1200}
        okText={'Проверить и сохранить'}
        onOk={() => {
          void vehicleForm
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме клиента повторите попытку');
              throw e;
            })
            .then(() => submitVehicle(vehicleForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setVehicle(undefined);
            });
        }}
        onCancel={() => setVehicle(undefined)}
      >
        <VerifyVehicle vehicle={vehicle} form={vehicleForm} />
      </Modal>
      {contextHolder}
    </>
  );
}

'use client';

import type { ApiVehicle, FormVehicle } from '@/entities/vehicle';
import VehicleService, { formVehicleSchema } from '@/entities/vehicle';
import { UploadDocument } from '@/features/upload';
import { VerifyVehicle } from '@/features/verify/vehicle';
import { Title } from '@/shared/ui/title';
import { useEntities } from '@/shared/utils/hooks/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Popconfirm, Space, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

export default function VehiclesTablesPage() {
  const { data: vehicles, loading, mutate: mutateTable } = useEntities(VehicleService);

  const [newVehicle, setNewVehicle] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehiclePassport, setVehiclePassport] = useState<RcFile>();
  const [vehicleRegistrationFront, setVehicleRegistrationFront] = useState<RcFile>();
  const [vehicleRegistrationBack, setVehicleRegistrationBack] = useState<RcFile>();

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

  const addVehicle = () => {
    if (!vehiclePassport) {
      messageApi.error('Чтобы продолжить, загрузите паспорт транспортного средства (ПТС)');
      return;
    }
    setLoadingVehicle(true);
    const vehicleData = new FormData();
    vehicleData.append('pts_main', vehiclePassport);
    if (vehicleRegistrationFront) {
      vehicleData.append('sts_front', vehicleRegistrationFront);
    }
    if (vehicleRegistrationBack) {
      vehicleData.append('sts_back', vehicleRegistrationBack);
    }
    void VehicleService.postAny(vehicleData, { stringify: false })
      .then((vehicle) => {
        setNewVehicle(false);
        setVehiclePassport(undefined);
        setVehicleRegistrationFront(undefined);
        setVehicleRegistrationBack(undefined);
        void mutateTable((vehicles) => [...(vehicles ?? []), vehicle]);
        setVehicle(vehicle);
      })
      .catch(() =>
        messageApi.error(
          'Не удалось загрузить данные транспортного средства. Повторите попытку позже'
        )
      )
      .finally(() => setLoadingVehicle(false));
  };

  const columns: ColumnsType<ApiVehicle> = [
    { key: 'pts_id', title: 'ПТС', dataIndex: 'pts_id' },
    { key: 'vin', title: 'VIN', dataIndex: 'vin' },
    { key: 'make_model', title: 'Марка и модель ТС', dataIndex: 'make_model' },
    { key: 'color', title: 'Цвет', dataIndex: 'color' },
    {
      key: 'created',
      title: 'Обновлён / Создан',
      render: (_, row: ApiVehicle) =>
        `${row.updated_at?.format('DD MMMM') ?? '???'} / ${row.created_at?.format('DD MMMM YYYY г.') ?? '???'}`,
    },
    {
      key: 'delete',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Popconfirm
          title="Удаление ТС"
          description="Вы уверены, что хотите удалить ТС?"
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true }}
          onConfirm={(e) => {
            e?.stopPropagation();
            void VehicleService.delete(uuid)
              .then(() => {
                void mutateTable((vehicles) => vehicles?.filter((v) => v.uuid !== uuid));
              })
              .catch(() => messageApi.error('Не удалось удалить ТС. Попробуйте позже'));
          }}
          onCancel={(e) => e?.stopPropagation()}
        >
          <Button
            danger
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
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
        scroll={{
          x: 'max-content',
        }}
      />
      <Button type="primary" onClick={() => setNewVehicle(true)}>
        <PlusOutlined />
        Добавить
      </Button>
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
        onCancel={() => {
          setVehicle(undefined);
          vehicleForm.resetFields();
        }}
      >
        <VerifyVehicle vehicle={vehicle} form={vehicleForm} />
      </Modal>
      <Modal
        open={newVehicle}
        onCancel={() => {
          setVehiclePassport(undefined);
          setVehicleRegistrationFront(undefined);
          setVehicleRegistrationBack(undefined);
          setNewVehicle(false);
        }}
        title={<Title level={2}>Добавить транспортное средство</Title>}
        okText="Добавить ТС"
        okButtonProps={{
          disabled: !vehiclePassport,
        }}
        width={695}
        onOk={() => void addVehicle()}
      >
        <Spin spinning={loadingVehicle}>
          <Space className="w-full">
            <UploadDocument
              file={vehiclePassport}
              onUpload={setVehiclePassport}
              text="Загрузите паспорт транспортного средства (ПТС)"
            />
            <UploadDocument
              file={vehicleRegistrationFront}
              onUpload={setVehicleRegistrationFront}
              text="Загрузите лицевую сторону свидетельства о регистрации (СТС)"
            />
            <UploadDocument
              file={vehicleRegistrationBack}
              onUpload={setVehicleRegistrationBack}
              text="Загрузите обратную сторону свидетельства о регистрации (СТС)"
            />
          </Space>
        </Spin>
      </Modal>
      {contextHolder}
    </Flex>
  );
}

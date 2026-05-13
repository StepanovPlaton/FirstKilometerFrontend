'use client';

import type { Procedure } from '@/entities/procedure';
import ProcedureService from '@/entities/procedure';
import { addCreatedAndUpdated, addTextSortAndFilters } from '@/features/tables/sort-filters';
import { useEntities } from '@/shared/utils/hooks/data';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, InputNumber, Modal, Popconfirm, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

type ProcedureRow = Procedure | Record<string, never>;

export default function OperationsPage() {
  const permissions = useAuthTokens((s) => s.permissions);
  const { data: procedures, loading, mutate: mutateTable } = useEntities(ProcedureService);
  const [procedure, setProcedure] = useState<ProcedureRow>();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<{ name: string; price: number; measure: string }>();

  useEffect(() => {
    if (procedure === undefined) {
      return;
    }
    if (procedure && 'id' in procedure && typeof procedure.id === 'number') {
      const p = procedure as Procedure;
      form.setFieldsValue({
        name: p.name,
        price: p.price,
        measure: p.measure || 'шт',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ name: '', measure: 'шт', price: 0 });
    }
  }, [procedure, form]);

  const submitProcedure = (values: { name: string; price: number; measure: string }) => {
    const payload = {
      name: values.name.trim(),
      price: values.price,
      measure: (values.measure || 'шт').trim().slice(0, 4) || 'шт',
    };

    const co = procedure;
    const id = co && 'id' in co && typeof co.id === 'number' ? co.id : undefined;

    if (id !== undefined) {
      return ProcedureService.patch({
        id,
        name: payload.name,
        price: payload.price,
        measure: payload.measure,
      } as Procedure)
        .then((received) =>
          mutateTable((list) => list?.map((p) => (p.id === id ? received : p)))
        )
        .catch(() => {
          messageApi.error('Не удалось сохранить операцию. Повторите попытку позже');
          throw new Error('save failed');
        });
    }

    return ProcedureService.postAny({ name: payload.name, price: payload.price, measure: payload.measure })
      .then((received) => mutateTable((list) => [...(list ?? []), received]))
      .catch(() => {
        messageApi.error('Не удалось создать операцию. Повторите попытку позже');
        throw new Error('create failed');
      });
  };

  const columns: ColumnsType<Procedure> = [
    {
      key: 'name',
      title: 'Наименование',
      dataIndex: 'name',
      ...addTextSortAndFilters<Procedure, 'name'>('name', procedures),
    },
    {
      key: 'price',
      title: 'Стоимость',
      dataIndex: 'price',
      render: (v: number) => (typeof v === 'number' ? v.toLocaleString('ru-RU') : v),
    },
    {
      key: 'measure',
      title: 'Ед. изм.',
      dataIndex: 'measure',
      width: 100,
    },
    ...addCreatedAndUpdated<Procedure>(),
    ...(permissions.includes('delete_procedure')
      ? [
          {
            key: 'delete',
            dataIndex: 'id',
            width: 72,
            render: (id: number) => (
              <Popconfirm
                title="Удаление операции"
                description="Удалить эту услугу/работу?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  void ProcedureService.delete(id)
                    .then(() => {
                      void mutateTable((list) => list?.filter((p) => p.id !== id));
                    })
                    .catch(() =>
                      messageApi.error('Не удалось удалить операцию. Попробуйте позже')
                    );
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
          } as ColumnsType<Procedure>[number],
        ]
      : []),
  ];

  if (!permissions.includes('view_procedure')) {
    return (
      <Flex vertical className="w-full" gap={8}>
        <p>Нет доступа к разделу «Операции».</p>
      </Flex>
    );
  }

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
      {permissions.includes('add_procedure') && (
        <Button type="primary" onClick={() => setProcedure({} as Procedure)}>
          <PlusOutlined />
          Добавить
        </Button>
      )}
      <Table<Procedure>
        className="w-full"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={procedures ?? ([] as Procedure[])}
        pagination={false}
        onRow={(record) => ({
          onClick: () => setProcedure(record),
        })}
        scroll={{ x: 'max-content' }}
      />
      <Modal
        centered
        open={procedure !== undefined}
        width={560}
        okText="Проверить и сохранить"
        okButtonProps={{
          disabled: !permissions.includes('change_procedure'),
        }}
        onOk={() => {
          void form
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме и повторите попытку');
              throw e;
            })
            .then(() => submitProcedure(form.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setProcedure(undefined);
              form.resetFields();
            });
        }}
        onCancel={() => {
          setProcedure(undefined);
          form.resetFields();
        }}
        title={
          procedure && 'id' in procedure && typeof procedure.id === 'number'
            ? 'Редактирование операции'
            : 'Новая операция'
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Наименование"
            rules={[{ required: true, message: 'Укажите наименование' }]}
          >
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Стоимость"
            rules={[{ required: true, message: 'Укажите стоимость' }]}
          >
            <InputNumber className="w-full" min={0} step={0.01} precision={2} />
          </Form.Item>
          <Form.Item
            name="measure"
            label="Единица измерения"
            rules={[{ required: true, message: 'Укажите единицу измерения' }, { max: 4 }]}
          >
            <Input maxLength={4} placeholder="шт" />
          </Form.Item>
        </Form>
      </Modal>
      {contextHolder}
    </Flex>
  );
}

'use client';

import type { InternalCompany } from '@/entities/internal-company';
import InternalCompanyService, { internalCompanySchema } from '@/entities/internal-company';
import { VerifyCompany } from '@/features/verify/company';
import { useEntities } from '@/shared/utils/hooks/data';
import { useAuthTokens } from '@/shared/utils/schemes/tokens';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

export default function InternalCompaniesTablesPage() {
  const permissions = useAuthTokens((s) => s.permissions);

  const { data: companies, loading, mutate: mutateTable } = useEntities(InternalCompanyService);
  const [company, setInternalCompany] = useState<InternalCompany>();
  const [messageApi, contextHolder] = message.useMessage();
  const [companyForm] = Form.useForm<InternalCompany>();
  useEffect(() => {
    companyForm.setFieldsValue(company as never as InternalCompany);
  }, [company, companyForm]);

  const submitInternalCompany = (values: InternalCompany) => {
    const validatedForm = internalCompanySchema.omit({ id: true }).safeParse({ ...values });
    if (validatedForm.success && validatedForm.data) {
      const newCompanyData = { ...validatedForm.data, id: company?.id };
      return (
        company?.id
          ? InternalCompanyService.putAny(newCompanyData as InternalCompany)
          : InternalCompanyService.post(validatedForm.data)
      )
        .then((receivedInternalCompany) => {
          if (company?.id) {
            return mutateTable((companies) =>
              companies?.map((c) => (c.id === company.id ? company : c))
            );
          } else {
            return mutateTable((companies) => [...(companies ?? []), receivedInternalCompany]);
          }
        })
        .catch((e) => {
          messageApi.error('Не удалось сохранить данные филиала. Повторите попытку позже');
          throw e;
        });
    } else {
      messageApi.error('Данные филиала заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  const columns: ColumnsType<InternalCompany> = [
    { key: 'short_name', title: 'Название', dataIndex: 'short_name' },
    { key: 'director', title: 'Директор', dataIndex: 'director_name' },
    { key: 'phone', title: 'Телефон', dataIndex: 'phone' },
    { key: 'email', title: 'Электронная почта', dataIndex: 'email' },
    {
      key: 'created',
      title: 'Обновлён / Создан',
      render: (_, row: InternalCompany) =>
        `${row.updated_at?.format('DD MMMM') ?? '???'} / ${row.created_at?.format('DD MMMM YYYY г.') ?? '???'}`,
    },
    ...(permissions.includes('delete_internalcompany')
      ? [
          {
            key: 'delete',
            dataIndex: 'id',
            render: (id: number) => (
              <Popconfirm
                title="Удаление филиала"
                description="Вы уверены, что хотите удалить филиал?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  void InternalCompanyService.delete(id)
                    .then(() => {
                      void mutateTable((companies) => companies?.filter((c) => c.id !== id));
                    })
                    .catch(() => messageApi.error('Не удалось удалить филиал. Попробуйте позже'));
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
        ]
      : []),
  ];

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
      <Table<InternalCompany>
        className="w-full"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={companies ?? ([] as InternalCompany[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setInternalCompany(record),
          };
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      {permissions.includes('add_internalcompany') && (
        <Button type="primary" onClick={() => setInternalCompany({} as InternalCompany)}>
          <PlusOutlined />
          Добавить
        </Button>
      )}
      <Modal
        open={!!company}
        width={550}
        okText={'Проверить и сохранить'}
        okButtonProps={{
          disabled: !permissions.includes('change_internalcompany'),
        }}
        onOk={() => {
          void companyForm
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме филиала повторите попытку');
              throw e;
            })
            .then(() => submitInternalCompany(companyForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setInternalCompany(undefined);
            });
        }}
        onCancel={() => {
          setInternalCompany(undefined);
          companyForm.resetFields();
        }}
      >
        <VerifyCompany company={company} form={companyForm} type="internal" />
      </Modal>
      {contextHolder}
    </Flex>
  );
}

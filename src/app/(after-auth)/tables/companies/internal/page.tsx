'use client';

import type { InternalCompany } from '@/entities/internal-company';
import InternalCompanyService from '@/entities/internal-company';
import {
  companyToFormValues,
  formatPaymentAccountsForTable,
  persistCompanyWithPaymentAccounts,
} from '@/features/companies/persistCompanyWithPaymentAccounts';
import { addCreatedAndUpdated, addTextSortAndFilters } from '@/features/tables/sort-filters';
import { VerifyCompany } from '@/features/verify/company';
import { useEntities } from '@/shared/utils/hooks/data';
import { companyFormValuesSchema, type CompanyFormValues } from '@/shared/utils/schemes/company';
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
  const [company, setInternalCompany] = useState<InternalCompany | Record<string, never>>();
  const [messageApi, contextHolder] = message.useMessage();
  const [companyForm] = Form.useForm<CompanyFormValues>();

  useEffect(() => {
    if (company === undefined) {
      return;
    }
    const co = company as InternalCompany;
    companyForm.setFieldsValue(companyToFormValues(co, 'internal'));
  }, [company, companyForm]);

  const submitInternalCompany = (values: CompanyFormValues) => {
    const validatedForm = companyFormValuesSchema.safeParse(values);
    if (!validatedForm.success) {
      messageApi.error('Данные филиала заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage ?? 'Ошибка валидации'));
    }

    const co = company;
    const companyId = co && 'id' in co && typeof co.id === 'number' ? co.id : undefined;

    return persistCompanyWithPaymentAccounts({
      mode: 'internal',
      ...(companyId !== undefined ? { companyId } : {}),
      values: validatedForm.data,
    })
      .then((receivedInternalCompany) => {
        if (companyId) {
          return mutateTable((list) =>
            list?.map((c) => (c.id === companyId ? receivedInternalCompany : c))
          );
        }
        return mutateTable((list) => [...(list ?? []), receivedInternalCompany]);
      })
      .catch((e) => {
        messageApi.error('Не удалось сохранить данные филиала. Повторите попытку позже');
        throw e;
      });
  };

  const columns: ColumnsType<InternalCompany> = [
    {
      key: 'short_name',
      title: 'Название',
      dataIndex: 'short_name',
      ...addTextSortAndFilters<InternalCompany, 'short_name'>('short_name', companies),
    },
    {
      key: 'payment_accounts',
      title: 'Счета',
      dataIndex: 'payment_accounts',
      render: (_: unknown, record: InternalCompany) => formatPaymentAccountsForTable(record),
    },
    {
      key: 'director',
      title: 'Директор',
      dataIndex: 'director_name',
      ...addTextSortAndFilters<InternalCompany, 'director_name'>('director_name', companies),
    },
    {
      key: 'phone',
      title: 'Телефон',
      dataIndex: 'phone',
      ...addTextSortAndFilters<InternalCompany, 'phone'>('phone', companies),
    },
    {
      key: 'email',
      title: 'Электронная почта',
      dataIndex: 'email',
      ...addTextSortAndFilters<InternalCompany, 'email'>('email', companies),
    },
    ...addCreatedAndUpdated<InternalCompany>(),
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
      {permissions.includes('add_internalcompany') && (
        <Button type="primary" onClick={() => setInternalCompany({} as InternalCompany)}>
          <PlusOutlined />
          Добавить
        </Button>
      )}
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
      <Modal
        open={!!company}
        width={720}
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

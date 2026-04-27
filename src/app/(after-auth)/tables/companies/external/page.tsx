'use client';

import type { ExternalCompany } from '@/entities/external-company';
import ExternalCompanyService from '@/entities/external-company';
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

export default function ExternalCompaniesTablesPage() {
  const permissions = useAuthTokens((s) => s.permissions);

  const { data: companies, loading, mutate: mutateTable } = useEntities(ExternalCompanyService);

  const [company, setExternalCompany] = useState<ExternalCompany | Record<string, never>>();
  const [messageApi, contextHolder] = message.useMessage();
  const [companyForm] = Form.useForm<CompanyFormValues>();

  useEffect(() => {
    if (company === undefined) {
      return;
    }
    const co = company as ExternalCompany;
    companyForm.setFieldsValue(companyToFormValues(co, 'external'));
  }, [company, companyForm]);

  const submitExternalCompany = (values: CompanyFormValues) => {
    const validatedForm = companyFormValuesSchema.safeParse(values);
    if (!validatedForm.success) {
      messageApi.error('Данные юридического лица заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage ?? 'Ошибка валидации'));
    }

    const co = company;
    const companyId = co && 'id' in co && typeof co.id === 'number' ? co.id : undefined;

    return persistCompanyWithPaymentAccounts({
      mode: 'external',
      ...(companyId !== undefined ? { companyId } : {}),
      values: validatedForm.data,
    })
      .then((receivedExternalCompany) => {
        if (companyId) {
          return mutateTable((list) =>
            list?.map((c) => (c.id === companyId ? receivedExternalCompany : c))
          );
        }
        return mutateTable((list) => [...(list ?? []), receivedExternalCompany]);
      })
      .catch((e) => {
        messageApi.error(
          'Не удалось сохранить данные юридического лица. Повторите попытку позже'
        );
        throw e;
      });
  };

  const columns: ColumnsType<ExternalCompany> = [
    {
      key: 'short_name',
      title: 'Название',
      dataIndex: 'short_name',
      ...addTextSortAndFilters<ExternalCompany, 'short_name'>('short_name', companies),
    },
    {
      key: 'payment_accounts',
      title: 'Счета',
      dataIndex: 'payment_accounts',
      render: (_: unknown, record: ExternalCompany) => formatPaymentAccountsForTable(record),
    },
    {
      key: 'director',
      title: 'Директор',
      dataIndex: 'director_name',
      ...addTextSortAndFilters<ExternalCompany, 'director_name'>('director_name', companies),
    },
    {
      key: 'phone',
      title: 'Телефон',
      dataIndex: 'phone',
      ...addTextSortAndFilters<ExternalCompany, 'phone'>('phone', companies),
    },
    {
      key: 'email',
      title: 'Электронная почта',
      dataIndex: 'email',
      ...addTextSortAndFilters<ExternalCompany, 'email'>('email', companies),
    },
    ...addCreatedAndUpdated<ExternalCompany>(),
    ...(permissions.includes('delete_externalcompany')
      ? [
          {
            key: 'delete',
            dataIndex: 'id',
            render: (id: number) => (
              <Popconfirm
                title="Удаление юридического лица"
                description="Вы уверены, что хотите удалить юридическое лицо?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  void ExternalCompanyService.delete(id)
                    .then(() => {
                      void mutateTable((companies) => companies?.filter((c) => c.id !== id));
                    })
                    .catch(() =>
                      messageApi.error('Не удалось удалить юридическое лицо. Попробуйте позже')
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
          },
        ]
      : []),
  ];

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
      {permissions.includes('add_externalcompany') && (
        <Button type="primary" onClick={() => setExternalCompany({} as ExternalCompany)}>
          <PlusOutlined />
          Добавить
        </Button>
      )}
      <Table<ExternalCompany>
        className="w-full"
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={companies ?? ([] as ExternalCompany[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setExternalCompany(record),
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
          disabled: !permissions.includes('change_externalcompany'),
        }}
        onOk={() => {
          void companyForm
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме юридического лица повторите попытку');
              throw e;
            })
            .then(() => submitExternalCompany(companyForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setExternalCompany(undefined);
            });
        }}
        onCancel={() => {
          setExternalCompany(undefined);
          companyForm.resetFields();
        }}
      >
        <VerifyCompany company={company} form={companyForm} type="external" />
      </Modal>
      {contextHolder}
    </Flex>
  );
}

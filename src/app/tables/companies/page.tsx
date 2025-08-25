'use client';

import type { Company } from '@/entities/company';
import CompanyService, { companySchema } from '@/entities/company';
import { VerifyCompany } from '@/features/verify/company';
import { useEntities } from '@/shared/utils/hooks/data';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

const columns: ColumnsType<Company> = [
  { key: 'short_name', title: 'Название', dataIndex: 'short_name' },
  { key: 'director', title: 'Директор', dataIndex: 'director_name' },
  { key: 'phone', title: 'Телефон', dataIndex: 'phone' },
  { key: 'email', title: 'Электронная почта', dataIndex: 'email' },
  {
    key: 'created',
    title: 'Обновлён / Создан',
    render: (_, row: Company) =>
      `${row.updated_at?.format('DD MMMM') ?? '???'} / ${row.created_at?.format('DD MMMM YYYY г.') ?? '???'}`,
  },
];

export default function ClientTablesPage() {
  const { data: companies, loading, mutate: mutateTable } = useEntities(CompanyService);
  const [company, setCompany] = useState<Company>();
  const [messageApi, contextHolder] = message.useMessage();
  const [companyForm] = Form.useForm<Company>();
  useEffect(() => {
    companyForm.setFieldsValue(company as never as Company);
  }, [company, companyForm]);

  const submitCompany = (values: Company) => {
    const validatedForm = companySchema
      .omit({ id: true })
      .safeParse({ ...values, id: company?.id });
    if (validatedForm.success && validatedForm.data) {
      return (
        company?.id
          ? CompanyService.putAny(validatedForm.data as Company)
          : CompanyService.post(validatedForm.data)
      )
        .then((receivedCompany) => {
          if (company?.id) {
            void mutateTable((companies) =>
              companies?.map((c) => (c.id === company.id ? company : c))
            );
          } else {
            void mutateTable((companies) => [...(companies ?? []), receivedCompany]);
          }
        })
        .catch((e) => {
          messageApi.error('Не удалось сохранить данные компании. Повторите попытку позже');
          throw e;
        });
    } else {
      messageApi.error('Данные компании заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
      <Table<Company>
        className="w-full"
        rowKey="uuid"
        loading={loading}
        columns={columns}
        dataSource={companies ?? ([] as Company[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setCompany(record),
          };
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      <Button type="primary" onClick={() => setCompany({} as Company)}>
        <PlusOutlined />
        Добавить
      </Button>
      <Modal
        open={!!company}
        width={550}
        okText={'Проверить и сохранить'}
        onOk={() => {
          void companyForm
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме компании повторите попытку');
              throw e;
            })
            .then(() => submitCompany(companyForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setCompany(undefined);
            });
        }}
        onCancel={() => {
          setCompany(undefined);
          companyForm.resetFields();
        }}
      >
        <VerifyCompany company={company} form={companyForm} />
      </Modal>
      {contextHolder}
    </Flex>
  );
}

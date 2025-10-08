'use client';

import type { ExternalCompany } from '@/entities/external-company';
import ExternalCompanyService, { externalCompanySchema } from '@/entities/external-company';
import { UploadDocument } from '@/features/upload';
import { VerifyCompany } from '@/features/verify/company';
import { Title } from '@/shared/ui/title';
import { useEntities } from '@/shared/utils/hooks/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Popconfirm, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

export default function ExternalCompaniesTablesPage() {
  const { data: companies, loading, mutate: mutateTable } = useEntities(ExternalCompanyService);

  const [newCompany, setNewCompany] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyDoc, setCompanyDoc] = useState<RcFile>();

  const [company, setExternalCompany] = useState<ExternalCompany>();
  const [messageApi, contextHolder] = message.useMessage();
  const [companyForm] = Form.useForm<ExternalCompany>();
  useEffect(() => {
    companyForm.setFieldsValue(company as never as ExternalCompany);
  }, [company, companyForm]);

  const submitExternalCompany = (values: ExternalCompany) => {
    const validatedForm = externalCompanySchema.omit({ id: true }).safeParse({ ...values });
    if (validatedForm.success && validatedForm.data) {
      const newCompanyData = { ...validatedForm.data, id: company?.id };
      return (
        company?.id
          ? ExternalCompanyService.putAny(newCompanyData as ExternalCompany)
          : ExternalCompanyService.post(newCompanyData)
      )
        .then((receivedExternalCompany) => {
          if (company?.id) {
            return mutateTable((companies) =>
              companies?.map((c) => (c.id === company.id ? company : c))
            );
          } else {
            return mutateTable((companies) => [...(companies ?? []), receivedExternalCompany]);
          }
        })
        .catch((e) => {
          messageApi.error(
            'Не удалось сохранить данные юридического лица. Повторите попытку позже'
          );
          throw e;
        });
    } else {
      messageApi.error('Данные юридического лица заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  const addExternalCompany = async () => {
    if (!companyDoc) {
      messageApi.error('Чтобы продолжить, загрузите документы юридического лица');
      return;
    }
    setLoadingCompany(true);
    const companyData = new FormData();
    companyData.append('company_card', companyDoc);
    await ExternalCompanyService.postAny(companyData, { stringify: false })
      .then((company) => {
        setNewCompany(false);
        setCompanyDoc(undefined);
        setExternalCompany(company);
        return mutateTable((companies) => [...(companies ?? []), company]);
      })
      .catch(() =>
        messageApi.error('Не удалось загрузить данные юридического лица. Повторите попытку позже')
      )
      .finally(() => setLoadingCompany(false));
  };

  const columns: ColumnsType<ExternalCompany> = [
    { key: 'short_name', title: 'Название', dataIndex: 'short_name' },
    { key: 'director', title: 'Директор', dataIndex: 'director_name' },
    { key: 'phone', title: 'Телефон', dataIndex: 'phone' },
    { key: 'email', title: 'Электронная почта', dataIndex: 'email' },
    {
      key: 'created',
      title: 'Обновлён / Создан',
      render: (_, row: ExternalCompany) =>
        `${row.updated_at?.format('DD MMMM') ?? '???'} / ${row.created_at?.format('DD MMMM YYYY г.') ?? '???'}`,
    },
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
  ];

  return (
    <Flex vertical align="end" className="w-full" gap={8}>
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
      <Button type="primary" onClick={() => setNewCompany(true)}>
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
      <Modal
        open={newCompany}
        onCancel={() => {
          setCompanyDoc(undefined);
          setNewCompany(false);
        }}
        title={<Title level={2}>Добавить юридичесоке лицо</Title>}
        okText="Добавить юридическое лицо"
        okButtonProps={{
          disabled: !companyDoc,
        }}
        width={400}
        onOk={() => void addExternalCompany()}
      >
        <Spin spinning={loadingCompany}>
          <Flex className="w-full" justify="space-around">
            <UploadDocument
              file={companyDoc}
              onUpload={setCompanyDoc}
              text="Загрузите документы юридического лица"
            />
          </Flex>
        </Spin>
      </Modal>
      {contextHolder}
    </Flex>
  );
}

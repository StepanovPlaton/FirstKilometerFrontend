'use client';

import type { ApiIndividual, FormIndividual } from '@/entities/individual';
import IndividualService, { formIndividualSchema } from '@/entities/individual';
import { UploadDocument } from '@/features/upload';
import { VerifyPerson } from '@/features/verify/person';
import { Title } from '@/shared/ui/title';
import { useEntities } from '@/shared/utils/hooks/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, message, Modal, Popconfirm, Space, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

export default function ClientTablesPage() {
  const { data: individuals, loading, mutate: mutateTable } = useEntities(IndividualService);

  const [newIndividual, setNewIndividual] = useState(false);
  const [loadingIndividual, setLoadingIndividual] = useState(false);
  const [passportMainPage, setPassportMainPage] = useState<RcFile>();
  const [passportRegistration, setPassportRegistration] = useState<RcFile>();

  const [individual, setIndividual] = useState<ApiIndividual>();
  const [messageApi, contextHolder] = message.useMessage();
  const [individualForm] = Form.useForm<FormIndividual>();
  useEffect(() => {
    individualForm.setFieldsValue(individual as never as FormIndividual);
  }, [individual, individualForm]);

  const submitIndividual = (values: FormIndividual) => {
    const validatedForm = formIndividualSchema.safeParse({ ...values, uuid: individual?.uuid });
    if (validatedForm.success) {
      return IndividualService.putAny(validatedForm.data)
        .then((individual) =>
          mutateTable((individuals) =>
            individuals?.map((u) => (u.uuid === individual.uuid ? individual : u))
          )
        )
        .catch((e) => {
          messageApi.error('Не удалось сохранить данные физ. лица. Повторите попытку позже');
          throw e;
        });
    } else {
      messageApi.error('Данные физ. лица заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  const addIndividual = async () => {
    if (!passportMainPage) {
      messageApi.error('Чтобы продолжить, загрузите главную страницу паспорта физ. лица');
      return;
    }
    if (!passportRegistration) {
      messageApi.error('Чтобы продолжить, загрузите страницу с пропиской из паспорта физ. лица');
      return;
    }
    setLoadingIndividual(true);
    const individualData = new FormData();
    individualData.append('passport_main', passportMainPage);
    individualData.append('passport_registration', passportRegistration);
    await IndividualService.postAny(individualData, { stringify: false })
      .then((individual) => {
        setNewIndividual(false);
        setPassportMainPage(undefined);
        setPassportRegistration(undefined);
        void mutateTable((individuals) => [...(individuals ?? []), individual]);
        setIndividual(individual);
      })
      .catch(() =>
        messageApi.error('Не удалось загрузить данные физ. лица. Повторите попытку позже')
      )
      .finally(() => setLoadingIndividual(false));
  };

  const deleteIndividual = (uuid: ApiIndividual['uuid']) => {
    void IndividualService.delete(uuid)
      .then(() => {
        void mutateTable((individuals) => individuals?.filter((i) => i.uuid !== uuid));
      })
      .catch(() => messageApi.error('Не удалось удалить физ. лицо. Попробуйте позже'));
  };

  const columns: ColumnsType<ApiIndividual> = [
    {
      key: 'licence_number',
      title: 'Серия и номер паспорта',
      dataIndex: 'licence_number',
    },
    {
      key: 'first_name',
      title: 'Имя',
      dataIndex: 'first_name',
    },
    {
      key: 'last_name',
      title: 'Фамилия',
      dataIndex: 'last_name',
    },
    {
      key: 'middle_name',
      title: 'Отчество',
      dataIndex: 'middle_name',
    },
    {
      key: 'birth_date',
      title: 'Дата рождения',
      dataIndex: 'birth_date',
      render: (birthdate: Dayjs | null) => birthdate?.format('DD MMMM YYYYг.'),
    },
    {
      key: 'created',
      title: 'Обновлён / Создан',
      render: (_, row: ApiIndividual) =>
        `${row.updated_at?.format('DD MMMM') ?? '???'} / ${row.created_at?.format('DD MMMM YYYY г.') ?? '???'}`,
    },
    {
      key: 'delete',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Popconfirm
          title="Удаление физ. лица"
          description="Вы уверены, что хотите удалить физ.лицо?"
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true }}
          onConfirm={(e) => {
            e?.stopPropagation();
            deleteIndividual(uuid);
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
      <Table<ApiIndividual>
        className="w-full"
        rowKey="uuid"
        loading={loading}
        columns={columns}
        dataSource={individuals ?? ([] as ApiIndividual[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setIndividual(record),
          };
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      <Button type="primary" onClick={() => setNewIndividual(true)}>
        <PlusOutlined />
        Добавить
      </Button>
      <Modal
        open={!!individual}
        width={1200}
        okText={'Проверить и сохранить'}
        onOk={() => {
          void individualForm
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме физ. лица повторите попытку');
              throw e;
            })
            .then(() => submitIndividual(individualForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setIndividual(undefined);
            });
        }}
        onCancel={() => {
          setIndividual(undefined);
          individualForm.resetFields();
        }}
      >
        <VerifyPerson
          person={individual}
          form={individualForm}
          type="individual"
          service={IndividualService}
          onPersonChange={(person) => setIndividual(individuals?.find((i) => i.uuid === person))}
        />
      </Modal>
      <Modal
        open={newIndividual}
        onCancel={() => {
          setPassportMainPage(undefined);
          setPassportRegistration(undefined);
          setNewIndividual(false);
        }}
        title={<Title level={2}>Добавить физ. лицо</Title>}
        okText="Добавить физ. лицо"
        okButtonProps={{
          disabled: !passportMainPage || !passportRegistration,
        }}
        width={475}
        onOk={() => void addIndividual()}
      >
        <Spin spinning={loadingIndividual}>
          <Space className="w-full">
            <UploadDocument
              file={passportMainPage}
              onUpload={setPassportMainPage}
              text="Загрузите паспорт (главная страница)"
            />
            <UploadDocument
              file={passportRegistration}
              onUpload={setPassportRegistration}
              text="Загрузите паспорт (прописка)"
            />
          </Space>
        </Spin>
      </Modal>
      {contextHolder}
    </Flex>
  );
}

'use client';

import type { ApiUser, FormUser } from '@/entities/user';
import UserService, { formUserSchema } from '@/entities/user';
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
  const { data: users, loading, mutate: mutateTable } = useEntities(UserService);

  const [newUser, setNewUser] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [passportMainPage, setPassportMainPage] = useState<RcFile>();
  const [passportRegistration, setPassportRegistration] = useState<RcFile>();

  const [user, setUser] = useState<ApiUser>();
  const [messageApi, contextHolder] = message.useMessage();
  const [userForm] = Form.useForm<FormUser>();
  useEffect(() => {
    userForm.setFieldsValue(user as never as FormUser);
  }, [user, userForm]);

  const submitUser = (values: FormUser) => {
    const validatedForm = formUserSchema.safeParse({ ...values, uuid: user?.uuid });
    if (validatedForm.success) {
      return UserService.putAny(validatedForm.data)
        .then((user) =>
          mutateTable((users) => users?.map((u) => (u.uuid === user.uuid ? user : u)))
        )
        .catch((e) => {
          messageApi.error('Не удалось сохранить данные клиента. Повторите попытку позже');
          throw e;
        });
    } else {
      messageApi.error('Данные клиента заполнены неправильно');
      const errorMessage = z.treeifyError(validatedForm.error).errors[0];
      if (errorMessage) {
        messageApi.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }
  };

  const addUser = async () => {
    if (!passportMainPage) {
      messageApi.error('Чтобы продолжить, загрузите главную страницу паспорта клиента');
      return;
    }
    if (!passportRegistration) {
      messageApi.error('Чтобы продолжить, загрузите страницу с пропиской из паспорта клиента');
      return;
    }
    setLoadingUser(true);
    const userData = new FormData();
    userData.append('passport_main', passportMainPage);
    userData.append('passport_registration', passportRegistration);
    await UserService.postAny(userData, { stringify: false })
      .then((user) => {
        setNewUser(false);
        setPassportMainPage(undefined);
        setPassportRegistration(undefined);
        void mutateTable((users) => [...(users ?? []), user]);
        setUser(user);
      })
      .catch(() => messageApi.error('Не удалось загрузить данные клиента. Повторите попытку позже'))
      .finally(() => setLoadingUser(false));
  };

  const addEmptyUser = () => {
    setLoadingUser(true);
    UserService.postAny({})
      .then((user) => {
        void mutateTable((users) => [...(users ?? []), user]);
        setUser(user);
      })
      .catch(() => messageApi.error('Не удалось создать клиента. Повторите попытку позже'))
      .finally(() => setLoadingUser(false));
  };

  const deleteUser = (uuid: ApiUser['uuid']) => {
    void UserService.delete(uuid)
      .then(() => {
        void mutateTable((users) => users?.filter((u) => u.uuid !== uuid));
      })
      .catch(() => messageApi.error('Не удалось удалить клиента. Попробуйте позже'));
  };

  const columns: ColumnsType<ApiUser> = [
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
      title: 'Имя',
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
      render: (_, row: ApiUser) =>
        `${row.updated_at?.format('DD MMMM') ?? '???'} / ${row.created_at?.format('DD MMMM YYYY г.') ?? '???'}`,
    },
    {
      key: 'delete',
      dataIndex: 'uuid',
      render: (uuid: string) => (
        <Popconfirm
          title="Удаление клиента"
          description="Вы уверены, что хотите удалить клиента?"
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{ danger: true }}
          onConfirm={(e) => {
            e?.stopPropagation();
            deleteUser(uuid);
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
      <Table<ApiUser>
        className="w-full"
        rowKey="uuid"
        loading={loading}
        columns={columns}
        dataSource={users ?? ([] as ApiUser[])}
        pagination={false}
        onRow={(record) => {
          return {
            onClick: () => setUser(record),
          };
        }}
        scroll={{
          x: 'max-content',
        }}
      />
      <Space>
        <Button type="primary" onClick={() => setNewUser(true)}>
          <PlusOutlined />
          Добавить
        </Button>
        <Button onClick={addEmptyUser}>
          <PlusOutlined />
          Добавить без документов
        </Button>
      </Space>

      <Modal
        open={!!user}
        width={1200}
        okText={'Проверить и сохранить'}
        onOk={() => {
          void userForm
            .validateFields()
            .catch((e) => {
              messageApi.warning('Исправьте ошибки в форме клиента повторите попытку');
              throw e;
            })
            .then(() => submitUser(userForm.getFieldsValue()))
            .then(() => {
              messageApi.success('Данные успешно сохранены');
              setUser(undefined);
            });
        }}
        onCancel={() => {
          setUser(undefined);
          userForm.resetFields();
        }}
      >
        <VerifyPerson
          person={user}
          form={userForm}
          type="user"
          service={UserService}
          onPersonChange={(person) => setUser(users?.find((u) => u.uuid === person))}
        />
      </Modal>
      <Modal
        open={newUser}
        onCancel={() => {
          setPassportMainPage(undefined);
          setPassportRegistration(undefined);
          setNewUser(false);
        }}
        title={<Title level={2}>Добавить клиента</Title>}
        okText="Добавить клиента"
        okButtonProps={{
          disabled: !passportMainPage || !passportRegistration,
        }}
        width={475}
        onOk={() => void addUser()}
      >
        <Spin spinning={loadingUser}>
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

'use client';

import type { ApiUser, FormUser } from '@/entities/user';
import UserService, { formUserSchema } from '@/entities/user';
import { VerifyUser } from '@/features/verify/user';
import { useEntities } from '@/shared/utils/hooks/data';
import { Form, message, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useEffect, useState } from 'react';
import z from 'zod';
dayjs.locale('ru');

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
    render: (birthdate: Dayjs) => birthdate.format('DD MMMM YYYYг.'),
  },
];

export default function ClientTablesPage() {
  const { data: users, loading, mutate: mutateTable } = useEntities(UserService);
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

  return (
    <>
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
      />
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
        onCancel={() => setUser(undefined)}
      >
        <VerifyUser user={user} form={userForm} />
      </Modal>
      {contextHolder}
    </>
  );
}

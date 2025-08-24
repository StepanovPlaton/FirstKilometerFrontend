'use client';

import type { FormUser } from '@/entities/user';
import { formUserSchema, default as UserService } from '@/entities/user';
import { Button, Card, Flex, Form, message } from 'antd';

import type { FormVehicle } from '@/entities/vehicle';
import VehicleService, { formVehicleSchema } from '@/entities/vehicle';
import { useEntity } from '@/shared/utils/hooks/data';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import z from 'zod';
import { VerifyUser } from '../../features/verify/user';
import { VerifyVehicle } from '../../features/verify/vehicle';
dayjs.locale('ru');

export default function VerifyPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const userUUID = searchParams.get('user');
  const vehicleUUID = searchParams.get('vehicle');

  const [messageApi, contextHolder] = message.useMessage();

  const { data: user, mutate: mutateUser } = useEntity(UserService, userUUID);
  const { data: vehicle, mutate: mutateVehicle } = useEntity(VehicleService, vehicleUUID);

  const [userForm] = Form.useForm<FormUser>();
  const [vehicleForm] = Form.useForm<FormVehicle>();

  useEffect(() => {
    userForm.setFieldsValue(user as never as FormUser);
  }, [user, userForm]);
  useEffect(() => {
    vehicleForm.setFieldsValue(vehicle as never as FormVehicle);
  }, [vehicle, vehicleForm]);

  const submitUser = (values: FormUser) => {
    const validatedForm = formUserSchema.safeParse({ ...values, uuid: userUUID });
    if (validatedForm.success) {
      return UserService.putAny(validatedForm.data)
        .then((user) => mutateUser(user))
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
  const submitVehicle = (values: FormVehicle) => {
    const validatedForm = formVehicleSchema.safeParse({ ...values, uuid: vehicleUUID });
    if (validatedForm.success) {
      return VehicleService.putAny(validatedForm.data)
        .then((vehicle) => mutateVehicle(vehicle))
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

  return (
    <Flex vertical align="center" className="w-full" gap={12}>
      <Card className="w-350 max-w-full">
        <VerifyUser user={user} form={userForm} />
      </Card>
      <Card className="w-350 max-w-full">
        <VerifyVehicle vehicle={vehicle} form={vehicleForm} />
      </Card>
      <Button
        type="primary"
        size="large"
        onClick={() => {
          void (async () => {
            await Promise.all([
              userForm.validateFields().catch((e) => {
                messageApi.warning('Исправьте ошибки в форме клиента повторите попытку');
                throw e;
              }),
              vehicleForm.validateFields().catch((e) => {
                messageApi.info(
                  'Исправьте ошибки в форме транспортного средства повторите попытку'
                );
                throw e;
              }),
            ])
              .then(() =>
                Promise.all([
                  submitUser(userForm.getFieldsValue()),
                  submitVehicle(vehicleForm.getFieldsValue()),
                ])
              )
              .then(() => {
                messageApi.success('Данные успешно сохранены');
                let url = `/download?user=${userUUID}&vehicle=${vehicleUUID}`;
                ['type', 'company', 'individual', 'price', 'tax', 'date'].forEach((key) => {
                  const value = searchParams.get(key);
                  if (value) {
                    url += `&${key}=${value}`;
                  }
                });
                router.push(url);
              });
          })();
        }}
      >
        Сгенерировать документы
      </Button>
      {contextHolder}
    </Flex>
  );
}

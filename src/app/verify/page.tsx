'use client';

import type { FormUser } from '@/entities/user';
import { formUserSchema, default as UserService } from '@/entities/user';
import { Button, Card, Flex, Form, message } from 'antd';

import type { ExternalCompany } from '@/entities/external-company';
import ExternalCompanyService, { externalCompanySchema } from '@/entities/external-company';
import type { InternalCompany } from '@/entities/internal-company';
import InternalCompanyService, { internalCompanySchema } from '@/entities/internal-company';
import type { FormVehicle } from '@/entities/vehicle';
import VehicleService, { formVehicleSchema } from '@/entities/vehicle';
import { VerifyCompany } from '@/features/verify/company';
import { VerifyPerson } from '@/features/verify/person';
import { useEntity } from '@/shared/utils/hooks/data';
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Подключаем русскую локаль dayjs
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import z from 'zod';
import { VerifyVehicle } from '../../features/verify/vehicle';
dayjs.locale('ru');

export default function VerifyPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const buyer = searchParams.get('buyer');
  const buyer_id = searchParams.get('buyer_id');
  const vehicleUUID = searchParams.get('vehicle');

  const [messageApi, contextHolder] = message.useMessage();

  const { data: user, mutate: mutateUser } = useEntity(UserService, buyer_id, undefined, {
    active: buyer === 'user',
  });
  const { data: internalCompany, mutate: mutateInternalCompany } = useEntity(
    InternalCompanyService,
    Number(buyer_id),
    undefined,
    {
      active: buyer === 'internal_company',
    }
  );
  const { data: externalCompany, mutate: mutateExternalCompany } = useEntity(
    ExternalCompanyService,
    Number(buyer_id),
    undefined,
    {
      active: buyer === 'external_company',
    }
  );
  const { data: vehicle, mutate: mutateVehicle } = useEntity(VehicleService, vehicleUUID);

  const [userForm] = Form.useForm<FormUser>();
  const [internalCompanyForm] = Form.useForm<InternalCompany>();
  const [externalCompanyForm] = Form.useForm<ExternalCompany>();
  const [vehicleForm] = Form.useForm<FormVehicle>();

  useEffect(() => {
    userForm.setFieldsValue(user as never as FormUser);
  }, [user, userForm]);
  useEffect(() => {
    if (internalCompany) {
      internalCompanyForm.setFieldsValue(internalCompany);
    }
  }, [internalCompany, internalCompanyForm]);
  useEffect(() => {
    if (externalCompany) {
      externalCompanyForm.setFieldsValue(externalCompany);
    }
  }, [externalCompany, externalCompanyForm]);
  useEffect(() => {
    vehicleForm.setFieldsValue(vehicle as never as FormVehicle);
  }, [vehicle, vehicleForm]);

  const submitUser = (values: FormUser) => {
    const validatedForm = formUserSchema.safeParse({ ...values, uuid: buyer_id });
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
  const submitInternalCompany = (values: InternalCompany) => {
    const validatedForm = internalCompanySchema.safeParse({ ...values, id: Number(buyer_id) });
    if (validatedForm.success) {
      return InternalCompanyService.putAny(validatedForm.data)
        .then((company) => mutateInternalCompany(company))
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
  const submitExternalCompany = (values: ExternalCompany) => {
    const validatedForm = externalCompanySchema.safeParse({ ...values, id: Number(buyer_id) });
    if (validatedForm.success) {
      return ExternalCompanyService.putAny(validatedForm.data)
        .then((company) => mutateExternalCompany(company))
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
        {buyer === 'user' ? (
          <VerifyPerson person={user} form={userForm} type="user" />
        ) : buyer === 'internal_company' ? (
          <VerifyCompany company={internalCompany} type="internal" form={internalCompanyForm} />
        ) : (
          <VerifyCompany company={externalCompany} type="external" form={externalCompanyForm} />
        )}
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
              buyer === 'user'
                ? userForm.validateFields().catch((e) => {
                    messageApi.warning('Исправьте ошибки в форме клиента и повторите попытку');
                    throw e;
                  })
                : buyer === 'internal_company'
                  ? internalCompanyForm.validateFields().catch((e) => {
                      messageApi.warning('Исправьте ошибки в форме филиала и повторите попытку');
                      throw e;
                    })
                  : externalCompanyForm.validateFields().catch((e) => {
                      messageApi.warning(
                        'Исправьте ошибки в форме юридического лица и повторите попытку'
                      );
                      throw e;
                    }),
              vehicleForm.validateFields().catch((e) => {
                messageApi.info(
                  'Исправьте ошибки в форме транспортного средства и повторите попытку'
                );
                throw e;
              }),
            ])
              .then(() =>
                Promise.all([
                  buyer === 'user'
                    ? submitUser(userForm.getFieldsValue())
                    : buyer === 'internal_company'
                      ? submitInternalCompany(internalCompanyForm.getFieldsValue())
                      : submitExternalCompany(externalCompanyForm.getFieldsValue()),
                  submitVehicle(vehicleForm.getFieldsValue()),
                ])
              )
              .then(() => {
                messageApi.success('Данные успешно сохранены');
                let url = `/download?vehicle=${vehicleUUID}`;
                [
                  'type',
                  'seller',
                  'seller_id',
                  'buyer',
                  'buyer_id',
                  'price',
                  'tax',
                  'options',
                  'date',
                ].forEach((key) => {
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

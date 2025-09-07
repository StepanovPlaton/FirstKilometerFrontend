'use client';

import type { ApiUser, User } from '@/entities/user';
import UserService from '@/entities/user';
import type { ApiVehicle } from '@/entities/vehicle';
import VehicleService from '@/entities/vehicle';
import { UploadDocument } from '@/features/upload';
import { Text } from '@/shared/ui/text';
import { Title } from '@/shared/ui/title';
import { useChoices } from '@/shared/utils/hooks/choices';
import { Button, Card, Flex, message, Select, Space, Spin } from 'antd';
import type { RcFile } from 'antd/lib/upload';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingUser, setLoadingUser] = useState(false);
  const [passportMainPage, setPassportMainPage] = useState<RcFile>();
  const [passportRegistration, setPassportRegistration] = useState<RcFile>();
  const [user, setUser] = useState<ApiUser>();
  const {
    data: existsUsers,
    loading: loadingExistsUsers,
    error: failedGetExistsUsers,
  } = useChoices(UserService);
  const [selectedUser, setSelectedUser] = useState<User['uuid']>();

  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehiclePassport, setVehiclePassport] = useState<RcFile>();
  const [vehicleRegistrationFront, setVehicleRegistrationFront] = useState<RcFile>();
  const [vehicleRegistrationBack, setVehicleRegistrationBack] = useState<RcFile>();
  const [vehicle, setVehicle] = useState<ApiVehicle>();
  const {
    data: existsVehicles,
    loading: loadingExistsVehicles,
    error: failedGetExistsVehicles,
  } = useChoices(VehicleService);
  const [selectedVehicle, setSelectedVehicle] = useState<number>();

  const [messageApi, contextHolder] = message.useMessage();

  const [validated, setValidated] = useState(false);

  const submit = () => {
    const requests: Promise<unknown>[] = [];
    if (!selectedUser) {
      if (!passportMainPage) {
        messageApi.error('Чтобы продолжить, загрузите главную страницу паспорта клиента');
        return;
      }
      if (!passportRegistration) {
        messageApi.error('Чтобы продолжить, загрузите страницу с пропиской из паспорта клиента');
        return;
      }
      requests.push(
        (async () => {
          setLoadingUser(true);
          const userData = new FormData();
          userData.append('passport_main', passportMainPage);
          userData.append('passport_registration', passportRegistration);
          return await UserService.postAny(userData, { stringify: false })
            .then((user) => setUser(user))
            .catch(() =>
              messageApi.error('Не удалось загрузить данные клиента. Повторите попытку позже')
            )
            .finally(() => setLoadingUser(false));
        })()
      );
    }
    if (!selectedVehicle) {
      if (!vehiclePassport) {
        messageApi.error('Чтобы продолжить, загрузите паспорт транспортного средства (ПТС)');
        return;
      }
      requests.push(
        (async () => {
          setLoadingVehicle(true);
          const vehicleData = new FormData();
          vehicleData.append('pts_main', vehiclePassport);
          if (vehicleRegistrationFront) {
            vehicleData.append('sts_front', vehicleRegistrationFront);
          }
          if (vehicleRegistrationBack) {
            vehicleData.append('sts_back', vehicleRegistrationBack);
          }
          return await VehicleService.postAny(vehicleData, { stringify: false })
            .then((vehicle) => setVehicle(vehicle))
            .catch(() =>
              messageApi.error(
                'Не удалось загрузить данные транспортного средства. Повторите попытку позже'
              )
            )
            .finally(() => setLoadingVehicle(false));
        })()
      );
    }
    void Promise.all(requests).then(() => setValidated(true));
  };

  useEffect(() => {
    const userUUID = selectedUser ?? user?.uuid;
    const vehicleUUID = selectedVehicle ?? vehicle?.uuid;

    if (validated && userUUID && vehicleUUID) {
      let url = `/verify?user=${userUUID}&vehicle=${vehicleUUID}`;
      [
        'type',
        'internal_company',
        'external_company',
        'individual',
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
    }
  }, [selectedUser, user, selectedVehicle, vehicle, searchParams, validated, router]);

  return (
    <Space direction="vertical" align="center" size="large" className="flex w-full">
      <Card className="w-100">
        <Flex justify="center">
          <Title level={2}>Клиент</Title>
        </Flex>
        <Spin spinning={loadingUser}>
          <Space direction="vertical" align="center">
            <Text>Добавьте нового клиента</Text>
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
            <Text>или</Text>
            <Select
              className="w-80"
              placeholder="Выберите существующего клиента"
              disabled={!!passportMainPage || !!passportRegistration || !!failedGetExistsUsers}
              loading={loadingExistsUsers}
              options={existsUsers ?? []}
              onChange={setSelectedUser}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Space>
        </Spin>
      </Card>
      <Card className="w-142">
        <Flex justify="center">
          <Title level={2}>Автомобиль</Title>
        </Flex>
        <Spin spinning={loadingVehicle}>
          <Space direction="vertical" align="center" className="w-full">
            <Text>Добавьте новый автомобиль</Text>
            <Space className="w-full">
              <UploadDocument
                file={vehiclePassport}
                onUpload={setVehiclePassport}
                text="Загрузите паспорт транспортного средства (ПТС)"
              />
              <UploadDocument
                file={vehicleRegistrationFront}
                onUpload={setVehicleRegistrationFront}
                text="Загрузите лицевую сторону свидетельства о регистрации (СТС)"
              />
              <UploadDocument
                file={vehicleRegistrationBack}
                onUpload={setVehicleRegistrationBack}
                text="Загрузите обратную сторону свидетельства о регистрации (СТС)"
              />
            </Space>
            <Text>или</Text>
            <Select
              className="w-80"
              placeholder="Выберите существующий автомобиль"
              disabled={
                !!vehiclePassport ||
                !!vehicleRegistrationFront ||
                !!vehicleRegistrationBack ||
                !!failedGetExistsVehicles
              }
              loading={loadingExistsVehicles}
              options={existsVehicles ?? []}
              onChange={setSelectedVehicle}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            />
          </Space>
        </Spin>
      </Card>
      <Button type="primary" size="large" onClick={() => void submit()}>
        Проверить данные
      </Button>
      {contextHolder}
    </Space>
  );
}

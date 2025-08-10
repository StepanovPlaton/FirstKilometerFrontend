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
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UploadPage() {
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
              messageApi.error('Не удалось загрузить данные клиента. Повторите попытку позже')
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
      redirect(`/verify?user=${userUUID}&vehicle=${vehicleUUID}`);
    }
  }, [selectedUser, user, selectedVehicle, vehicle, validated]);

  return (
    <Space direction="vertical" align="center" size="large">
      <Space size="large">
        <Card className="w-100">
          <Flex justify="center">
            <Title level={2}>Клиент</Title>
          </Flex>
          <Spin spinning={loadingUser}>
            <Space direction="vertical" align="center" className="w-full">
              <Text>Добавьте нового клиента</Text>
              <Space className="w-full">
                <UploadDocument
                  onUpload={setPassportMainPage}
                  text="Загрузите паспорт (главная страница)"
                />
                <UploadDocument
                  onUpload={setPassportRegistration}
                  text="Загрузите паспорт (прописка)"
                />
              </Space>
              <Text>или</Text>
              <Select
                className="w-80"
                placeholder="Выберите существующего клиента"
                disabled={
                  !!passportMainPage ||
                  !!passportRegistration ||
                  !!failedGetExistsUsers ||
                  existsUsers?.length === 0
                }
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
                  onUpload={setVehiclePassport}
                  text="Загрузите паспорт транспортного средства (ПТС)"
                />
                <UploadDocument
                  onUpload={setVehicleRegistrationFront}
                  text="Загрузите лицевую сторону свидетельства о регистрации (СТС)"
                />
                <UploadDocument
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
                  !!failedGetExistsVehicles ||
                  existsVehicles?.length === 0
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
      </Space>
      <Button type="primary" size="large" onClick={() => void submit()}>
        Проверить данные
      </Button>
      {contextHolder}
    </Space>
  );
}
